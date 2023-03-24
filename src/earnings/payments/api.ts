// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from '../../main'
import { EarningsPayment } from './db'
import { Key } from '../../db'
import { RequestHandler } from 'express'
import { present } from './http'
import { query } from '@edge/misc-utils'
import { DeepNonNullable, Terms } from 'arangosearch'

const sortFields: (keyof EarningsPayment)[] = [
  'amount',
  'hash',
  'nonce',
  'recipient',
  'sender',
  'signature',
  'timestamp'
]

export const list = ({ model }: Context): RequestHandler => async (req, res, next) => {
  const limit = query.integer(req.query.limit, 1, 100) || 10
  const page = query.integer(req.query.page, 1) || 1
  const skip = limit * (page - 1)

  const recipient = query.array(req.query.recipient)
  const sender = query.array(req.query.sender)
  const hash = query.array(req.query.hash)

  const since = query.integer(req.query.since)
  const until = query.integer(req.query.until)

  let terms: Terms<Key & DeepNonNullable<EarningsPayment>> | undefined
  if (recipient.length || sender.length || hash.length || since !== undefined || until !== undefined) {
    terms = {}
    if (recipient.length) terms.recipient = { in: recipient }
    if (sender.length) terms.sender = { in: sender }
    if (hash.length) terms.hash = { in: hash }
    if (since !== undefined || until !== undefined) {
      terms.timestamp = {}
      if (since !== undefined) terms.timestamp.gte = since
      if (until !== undefined) terms.timestamp.lt = until
    }
  }

  const sort = query.sorts<EarningsPayment>(req.query.sort, sortFields, ['hash', 'ASC'])

  try {
    const [totalCount, payments] = await model.earningsPayments.search(terms, [skip, limit], sort)

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

export const listHighest = ({ config, model }: Context): RequestHandler => async (req, res, next) => {
  const limit = query.integer(req.query.limit, 1, 100) || 10
  const page = query.integer(req.query.page, 1) || 1
  const skip = query.integer(req.query.skip, 0) || limit * (page - 1)

  try {
    const lastDraw = await model.draws.find(undefined, ['timestamp', 'DESC'])
    const since = lastDraw?.timestamp || config.startTime

    const terms: Terms<Key & DeepNonNullable<EarningsPayment>> = {
      timestamp: { gte: since }
    }

    const { totalCount, results } = await model.earningsPayments.searchHighest(terms, [skip, limit])

    res.json({
      results,
      metadata: {
        count: results.length,
        limit,
        page,
        skip,
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
