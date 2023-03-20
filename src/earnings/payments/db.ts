import * as xe from '@edge/xe-utils'
import { Context } from '../../main'
import { Key } from '../../db'
import arangosearch from 'arangosearch'

export type EarningsPaymentsModel = ReturnType<typeof model>

export type EarningsPayment = xe.tx.Tx

const key = (p: EarningsPayment): Key & EarningsPayment => ({ ...p, _key: p.hash })

const model = (ctx: Context) => {
  const ep = ctx.db.collection<EarningsPayment>('earningsPayments')

  return {
    init: async () => {
      if (!await ep.exists()) await ep.create()
    },
    find: arangosearch.find(ctx.db, ep),
    get: (key: string) => ep.document(key),
    insertMany: (ps: EarningsPayment[]) => ep.saveAll(ps.map(key), { returnNew: true }),
    search: arangosearch.search(ctx.db, ep)
  }
}

export default model
