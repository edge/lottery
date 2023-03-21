import { Context } from '../../main'
import { EarningsPayment } from './db'
import { Key } from '../../db'
import { RequestHandler } from 'express'
import { present } from './http'
import { DeepNonNullable, Terms } from 'arangosearch'
import { array, numeric, sorts } from '../../http/query'

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
  const limit = numeric(req.query.limit, 1, 100) || 10
  const page = numeric(req.query.page, 1) || 1
  const skip = limit * (page - 1)

  const recipient = array(req.query.recipient)
  const sender = array(req.query.sender)
  const hash = array(req.query.hash)

  const since = numeric(req.query.since)
  const until = numeric(req.query.until)

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

  const sort = sorts<EarningsPayment>(req.query.sort, ['hash', 'ASC'], sortFields)

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
  const limit = numeric(req.query.limit, 1, 100) || 10
  const page = numeric(req.query.page, 1) || 1
  const skip = numeric(req.query.skip, 0) || limit * (page - 1)

  try {
    // @todo implement since last release
    const since = config.startTime

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
