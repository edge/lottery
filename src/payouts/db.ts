import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import arangosearch from 'arangosearch'
import { Key, Update } from '../db'

export type PayoutsModel = ReturnType<typeof model>

export type Payout = {
  release: string
  status: PayoutStatus
  tx: PayoutTx
}

export type PayoutTx = Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>> & {
  data: xe.tx.TxData & {
    ref: string
  }
}

export type PayoutStatus = 'unsent' | 'pending' | 'processed' | 'confirmed'

const key = (p: Payout): Key & Payout => ({ ...p, _key: p.tx.data.ref })

const model = (ctx: Context) => {
  const ep = ctx.db.collection<Payout>('payouts')

  return {
    init: async () => {
      if (!await ep.exists()) await ep.create()
    },
    find: arangosearch.find(ctx.db, ep),
    get: (key: string) => ep.document(key),
    insertMany: (ps: Payout[]) => ep.saveAll(ps.map(key), { returnNew: true }),
    search: arangosearch.search(ctx.db, ep),
    updateMany: (ps: Update<Payout>[]) => ep.updateAll(ps, { returnNew: true })
  }
}

export default model
