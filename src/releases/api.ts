import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import { Release } from './db'
import { RequestHandler } from 'express'
import { present } from './http'
import { http as sdkHttp, identity, validate } from '@edge/api-sdk'

export const create = ({ config, model }: Context): RequestHandler => {
  type Data = {
    release: Pick<Release, 'winners'>
  }

  const readBody = validate.validate<Data>({
    release: {
      winners: arr => {
        console.log(arr)
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
    const release = <Release>{}

    try {
      const data = readBody(req.body)
      release.winners = data.release.winners.map(identity)
    }
    catch (err) {
      return sdkHttp.badRequest(res, next, { error: (err as Error).message })
    }

    // @todo implement since last release
    const since = config.startTime

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

    release.timestamp = Date.now()
    try {
      const doc = await model.releases.insert(release)
      res.json({ release: present(doc) })
      next()
    }
    catch (err) {
      next(err)
    }
  }
}
