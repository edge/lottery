// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import { RequestHandler } from 'express'
import { present } from './http'
import { present as presentPayout } from '../payouts/http'
import { DeepNonNullable, Filter, Terms } from 'arangosearch'
import { Document, DocumentMetadata } from 'arangojs/documents'
import { Draw, Winner } from './db'
import { Key, isArangoError, isArangoNotFound } from '../db'
import { Payout, PayoutTx } from '../payouts/db'
import { identity, query, http as sdkHttp, unique, validate } from '@edge/misc-utils'

const MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/** Format date for memo. */
const toMemoDate = (timestamp: number) => {
  const d = new Date(timestamp)
  const m = MONTH[d.getUTCMonth()]
  const y = d.getUTCFullYear()
  return `${m} ${y}`
}

/** Create a new draw. */
export const create = ({ config, model, payer, log }: Context): RequestHandler => {
  type Data = {
    draw: Pick<Draw, 'winners'>
  }

  // basic input validation
  const readBody = validate.validate<Data>({
    draw: {
      winners: arr => {
        if (!(arr instanceof Array)) throw new Error('must be an array')
        for (const value of arr) {
          if (value instanceof Array) throw new Error('value must not be an array')
          if (typeof value !== 'object') throw new Error('value must be an object')
          try {
            validate.hex(value.hash)
          }
          catch (err) {
            throw new Error(`hex ${err}`)
          }
          if (!xe.wallet.validateAddress(value.recipient)) throw new Error('recipient must be an XE address')
        }
      }
    }
  })

  return async (req, res, next) => {
    let since: number
    try {
      const lastDraw = await model.draws.find(undefined, ['timestamp', 'DESC'])
      since = lastDraw?.timestamp || config.startTime
    }
    catch (err) {
      return next(err)
    }

    const draw = <Draw>{}

    // read and validate winners input
    try {
      const data = readBody(req.body)
      draw.winners = data.draw.winners.map(identity)

      // check correct number of unique hashes and recipients
      const hashes = draw.winners.map(w => w.hash).filter(unique)
      if (hashes.length !== draw.winners.length) throw new Error('duplicate hash')
      const wallets = draw.winners.map(w => w.recipient).filter(unique)
      if (wallets.length !== draw.winners.length) throw new Error('duplicate recipient')

      // check all winning hashes exist
      const [, txs] = await model.earningsPayments.search({ hash: { in: hashes }})
      if (txs.length < draw.winners.length) {
        const foundHashes = txs.map(tx => tx.hash)
        const missing = hashes.filter(h => !foundHashes.includes(h))
        throw new validate.ValidateError('draw.winners', `transactions not found (${missing.join(', ')})`)
      }

      // check all winning transactions are in allowed period (i.e. since last draw)
      const outdated = txs.filter(tx => tx.timestamp < since)
      if (outdated.length > 0) {
        const outdatedHashes = outdated.map(tx => tx.hash)
        throw new validate.ValidateError('draw.winners', `transactions too old (${outdatedHashes.join(', ')})`)
      }

      // check no winning transaction has already been rewarded
      const [, existPayouts] = await model.payouts.search({ _key: { in: hashes } })
      if (existPayouts.length) {
        const existHashes = existPayouts.map(p => p._key)
        // eslint-disable-next-line max-len
        throw new validate.ValidateError('draw.winners.hash', `some transactions already rewarded (${existHashes.join(', ')})`)
      }

      const sortedHashes = hashes.map(identity).sort()
      for (const i in sortedHashes) {
        // check winning hashes are sorted correctly
        if (hashes[i] !== sortedHashes[i]) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('draw.winners', `incorrectly sorted transactions (got ${hashes[i]}, expected ${sortedHashes[i]})`)
        }

        // check winning hash data is correct
        const origTx = txs.find(tx => tx.hash === sortedHashes[i]) as Document<xe.tx.Tx>
        const tx = draw.winners.find(w => w.hash === sortedHashes[i]) as Winner
        if (tx.recipient !== origTx.recipient) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('draw.winners.recipient', `incorrect recipient for transaction ${tx.hash} (got ${tx.recipient}, expected ${origTx.recipient})`)
        }
        if (tx.amount !== config.funds.distribution[i]) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('draw.winners.amount', `incorrect amount for transaction ${tx.hash} (got ${tx.amount}, expected ${config.funds.distribution})`)
        }
      }
    }
    catch (err) {
      if ((err as Error).name === 'ValidateError') {
        const ve = err as validate.ValidateError
        return sdkHttp.badRequest(res, next, { param: ve.param, reason: ve.message })
      }
      else return next(err)
    }

    // check payer is funded
    const info = await payer.refresh()
    if (info.balance < config.funds.distribution.reduce((a, b) => a + b)) {
      return sdkHttp.paymentRequired(res, next, { reason: 'insufficient payer funds' })
    }

    // attach highest hashes snapshot to draw
    // this is not used heavily, just retained for future reference in case of any dispute
    try {
      const { results: highest } = await model.earningsPayments.searchHighest(
        { timestamp: { gte: since } },
        [0, config.funds.distribution.length]
      )
      draw.highestHashes = highest.map(tx => ({
        hash: tx.hash,
        recipient: tx.recipient
      }))
    }
    catch (err) {
      return next(err)
    }

    // attach timestamp to draw
    draw.timestamp = Date.now()
    const memoDate = toMemoDate(draw.timestamp)

    try {
      const doc = await model.draws.insert(draw)

      // generate payout transactions (which will be signed later)
      const unsigned = draw.winners.map<PayoutTx>(w => ({
        timestamp: draw.timestamp,
        sender: config.funds.payer.address,
        recipient: w.recipient,
        amount: w.amount,
        nonce: 0,
        data: {
          ref: w.hash,
          memo: `Lottery Winnings ${memoDate}`
        }
      }))
      const payouts = unsigned.map<Partial<DocumentMetadata> & Payout>(tx => ({
        draw: doc._key,
        status: 'unsent',
        tx
      }))

      const results = await model.payouts.insertMany(payouts)
      const errors = results.filter(isArangoError)
      errors.forEach(err => log.error(err))
      if (errors.length > 0) {
        return next(new Error('failed to insert all payouts'))
      }

      res.json({
        draw: present(doc),
        payouts: payouts.map(presentPayout)
      })
      next()
    }
    catch (err) {
      next(err)
    }
  }
}

/** Retrieve a draw. */
export const get = ({ model }: Context): RequestHandler => async (req, res, next) => {
  const key = query.str(req.params.key)
  if (!key) return sdkHttp.badRequest(res, next, { reason: 'invalid key' })

  try {
    const draw = await model.draws.get(key)

    const [, payouts] = await model.payouts.search({ draw: { eq: draw._key }})

    res.json({
      draw: present(draw),
      payouts: payouts.map(presentPayout).reduce((ps, p) => {
        ps[p.tx.data.ref] = p as Payout
        return ps
      }, <Record<string, Payout>>{})
    })
  }
  catch (err) {
    return isArangoNotFound(err) ? sdkHttp.notFound(res, next) : next(err)
  }
}

/** List draws. */
export const list = ({ model }: Context): RequestHandler => async (req, res, next) => {
  const limit = query.integer(req.query.limit, 1, 100) || 10
  const page = query.integer(req.query.page, 1) || 1
  const skip = limit * (page - 1)

  const since = query.integer(req.query.since)
  const until = query.integer(req.query.until)

  let terms: Terms<Key & DeepNonNullable<Draw>> | undefined
  if (since !== undefined || until !== undefined) {
    const timestamp: Filter<number> = {}
    if (since !== undefined) timestamp.gte = since
    if (until !== undefined) timestamp.lt = until
    terms = { timestamp }
  }

  const sort = query.sorts<Draw>(req.query.sort, ['timestamp'], ['timestamp', 'DESC'])

  try {
    const [totalCount, payments] = await model.draws.search(terms, [skip, limit], sort)

    res.json({
      results: payments.map(present),
      metadata: {
        count: payments.length,
        limit,
        page,
        skip,
        sort,
        terms,
        totalCount
      }
    })
    next()
  }
  catch (err) {
    next(err)
  }
}
