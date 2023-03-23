import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import arangosearch from 'arangosearch'
import { BlockID, BlockTx } from '@edge/xe-sync'
import { Key, Update, isArangoError } from '../db'

export type PayoutsModel = ReturnType<typeof model>

export type Payout = {
  attempts?: number
  lastResponse?: string
  release: string
  status: PayoutStatus
  tx: PayoutTx
  block?: BlockID
}

export type PayoutTx = Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>> & {
  data: xe.tx.TxData & {
    ref: string
  }
}

export type PayoutStatus = 'unsent' | 'pending' | 'processing' | 'confirmed'

const key = (p: Payout): Key & Payout => ({ ...p, _key: p.tx.data.ref })

const model = (ctx: Context) => {
  const ep = ctx.db.collection<Payout>('payouts')

  const self = {
    init: async () => {
      if (!await ep.exists()) await ep.create()
    },
    find: arangosearch.find(ctx.db, ep),
    index: async (txs: BlockTx[]) => {
      const refs = txs.map(tx => tx.tx.data.ref).filter(Boolean) as string[]
      const [count, payouts] = await self.search({ _key: { in: refs } } )
      if (count === 0) return
      const updates = payouts.map<Update<Payout>>(p => {
        const tx = txs.find(tx => tx.tx.data.ref === p.tx.data.ref) as BlockTx
        return {
          _key: p._key,
          hash: tx.tx.hash,
          block: tx.block,
          status: 'processing'
        }
      })
      const result = await self.updateMany(updates)
      const errors = result.filter(isArangoError)
      errors.forEach(err => ctx.log.error('failed to update payout', err))
      ctx.log.info('updated payouts', { num: result.length - errors.length, errors: errors.length })
    },
    get: (key: string) => ep.document(key),
    insertMany: (ps: Payout[]) => ep.saveAll(ps.map(key), { returnNew: true }),
    search: arangosearch.search(ctx.db, ep),
    updateMany: (ps: Update<Payout>[]) => ep.updateAll(ps, { returnNew: true })
  }

  return self
}

export default model
