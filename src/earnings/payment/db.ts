import * as xe from '@edge/xe-utils'
import { Context } from '../../main'
import arangosearch from 'arangosearch'

export type EarningsPaymentModel = ReturnType<typeof model>

export type EarningsPayment = xe.tx.Tx

const model = (ctx: Context) => {
  const c = ctx.db.collection<EarningsPayment>('earningsPayment')

  return {
    init: async () => {
      if (!await c.exists()) await c.create()
    },
    get: (key: string) => c.document(key),
    search: arangosearch.search(ctx.db, c)
  }
}

export default model
