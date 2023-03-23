import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import { RequestHandler } from 'express'
import { present } from './http'
import { present as presentPayout } from '../payouts/http'
import { DeepNonNullable, Filter, Terms } from 'arangosearch'
import { Document, DocumentMetadata } from 'arangojs/documents'
import { Key, isArangoNotFound, newDoc } from '../db'
import { Payout, PayoutTx } from '../payouts/db'
import { Release, Winner } from './db'
import { identity, query, http as sdkHttp, unique, validate } from '@edge/api-sdk'

const MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const toMemoDate = (timestamp: number) => {
  const d = new Date(timestamp)
  const m = MONTH[d.getUTCMonth()]
  const y = d.getUTCFullYear()
  return `${m} ${y}`
}

export const create = ({ config, model }: Context): RequestHandler => {
  type Data = {
    release: Pick<Release, 'winners'>
  }

  const readBody = validate.validate<Data>({
    release: {
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
      const lastRelease = await model.releases.find(undefined, ['timestamp', 'DESC'])
      since = lastRelease?.timestamp || config.startTime
    }
    catch (err) {
      return next(err)
    }

    const release = <Release>{}

    // read and validate winners input
    try {
      const data = readBody(req.body)
      release.winners = data.release.winners.map(identity)

      // check correct number of unique hashes and recipients
      const hashes = release.winners.map(w => w.hash).filter(unique)
      if (hashes.length !== release.winners.length) throw new Error('duplicate hash')
      const wallets = release.winners.map(w => w.recipient).filter(unique)
      if (wallets.length !== release.winners.length) throw new Error('duplicate recipient')

      // check all winning hashes exist
      const [, txs] = await model.earningsPayments.search({ hash: { in: hashes }})
      if (txs.length < release.winners.length) {
        const foundHashes = txs.map(tx => tx.hash)
        const missing = hashes.filter(h => !foundHashes.includes(h))
        throw new validate.ValidateError('release.winners', `transactions not found (${missing.join(', ')})`)
      }

      // check all winning transactions are in allowed period (i.e. since last release)
      const outdated = txs.filter(tx => tx.timestamp < since)
      if (outdated.length > 0) {
        const outdatedHashes = outdated.map(tx => tx.hash)
        throw new validate.ValidateError('release.winners', `transactions too old (${outdatedHashes.join(', ')})`)
      }

      const sortedHashes = hashes.map(identity).sort()
      for (const i in sortedHashes) {
        // check winning hashes are sorted correctly
        if (hashes[i] !== sortedHashes[i]) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('release.winners', `incorrectly sorted transactions (got ${hashes[i]}, expected ${sortedHashes[i]})`)
        }

        // check winning hash data is correct
        const origTx = txs.find(tx => tx.hash === sortedHashes[i]) as Document<xe.tx.Tx>
        const tx = release.winners.find(w => w.hash === sortedHashes[i]) as Winner
        if (tx.recipient !== origTx.recipient) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('release.winners.recipient', `incorrect recipient for transaction ${tx.hash} (got ${tx.recipient}, expected ${origTx.recipient})`)
        }
        if (tx.amount !== config.funds.distribution[i]) {
          // eslint-disable-next-line max-len
          throw new validate.ValidateError('release.winners.amount', `incorrect amount for transaction ${tx.hash} (got ${tx.amount}, expected ${config.funds.distribution})`)
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

    // attach highest hashes snapshot to release
    try {
      const { results: highest } = await model.earningsPayments.searchHighest(
        { timestamp: { gte: since } },
        [0, config.funds.distribution.length]
      )
      release.highestHashes = highest.map(tx => ({
        hash: tx.hash,
        recipient: tx.recipient
      }))
    }
    catch (err) {
      return next(err)
    }

    // attach timestamp to release
    release.timestamp = Date.now()
    const memoDate = toMemoDate(release.timestamp)

    try {
      const doc = await model.releases.insert(release)

      const unsigned = release.winners.map<PayoutTx>(w => ({
        timestamp: release.timestamp,
        sender: config.funds.payer.address,
        recipient: w.recipient,
        amount: w.amount,
        nonce: 0,
        data: {
          ref: w.hash,
          memo: `Lottery Winnings ${memoDate}`
        }
      }))
      let payouts = unsigned.map<Partial<DocumentMetadata> & Payout>(tx => ({
        release: doc._key,
        status: 'unsent',
        tx
      }))
      payouts = (await model.payouts.insertMany(payouts)).map(newDoc)

      res.json({
        release: present(doc),
        payouts: payouts.map(presentPayout)
      })
      next()
    }
    catch (err) {
      next(err)
    }
  }
}

export const get = ({ model }: Context): RequestHandler => async (req, res, next) => {
  const key = query.str(req.params.key)
  if (!key) return sdkHttp.badRequest(res, next, { reason: 'invalid key' })

  try {
    const release = await model.releases.get(key)

    const [, payouts] = await model.payouts.search({ release: { eq: release._key }})

    res.json({
      release: present(release),
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

export const list = ({ model }: Context): RequestHandler => async (req, res, next) => {
  const limit = query.integer(req.query.limit, 1, 100) || 10
  const page = query.integer(req.query.page, 1) || 1
  const skip = limit * (page - 1)

  const since = query.integer(req.query.since)
  const until = query.integer(req.query.until)

  let terms: Terms<Key & DeepNonNullable<Release>> | undefined
  if (since !== undefined || until !== undefined) {
    const timestamp: Filter<number> = {}
    if (since !== undefined) timestamp.gte = since
    if (until !== undefined) timestamp.lt = until
    terms = { timestamp }
  }

  const sort = query.sorts<Release>(req.query.sort, ['timestamp'], ['timestamp', 'DESC'])

  try {
    const [totalCount, payments] = await model.releases.search(terms, [skip, limit], sort)

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
