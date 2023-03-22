import { Context } from '../main'
import { EarningsPayment } from '../earnings/payments/db'
import arangosearch from 'arangosearch'
import { newDoc } from '../db'

export type ReleasesModel = ReturnType<typeof model>

export type Release = {
  timestamp: number
  winners: Winner[]
  highestHashes: Pick<EarningsPayment, 'hash' | 'recipient'>[]
}

export type Winner = Pick<EarningsPayment, 'amount' | 'hash' | 'recipient'>

const model = (ctx: Context) => {
  const r = ctx.db.collection<Release>('releases')

  return {
    init: async () => {
      if (!await r.exists()) await r.create()
    },
    find: arangosearch.find(ctx.db, r),
    get: (key: string) => r.document(key),
    insert: (release: Release) => r.save(release, { returnNew: true }).then(newDoc),
    search: arangosearch.search(ctx.db, r)
  }
}

export default model
