import * as xe from '@edge/xe-utils'
import { Context } from '../../main'
import { Document } from 'arangojs/documents'
import { Key } from '../../db'
import { aql } from 'arangojs'
import arangosearch from 'arangosearch'
import { DeepNonNullable, Limit, Terms } from 'arangosearch'

export type EarningsPaymentsModel = ReturnType<typeof model>

export type EarningsPayment = xe.tx.Tx

const key = (p: EarningsPayment): Key & EarningsPayment => ({ ...p, _key: p.hash })

const searchHighest = ({ db }: Context) => async (terms?: Terms<DeepNonNullable<EarningsPayment>>, limit?: Limit) => {
  type Data = {
    totalCount: number
    results: Document<EarningsPayment>[]
  }

  const filter = aql.literal(terms ? `FILTER ${arangosearch.parseTerms(terms, 'p').join(' FILTER ')}` : undefined)
  const page = aql.literal(limit ? `LIMIT ${arangosearch.parseLimit(limit)}` : undefined)

  const query = aql`
    LET txs = (
      FOR p IN earningsPayments
        ${filter}
        COLLECT recipient = p.recipient INTO txs
        LET tx = FIRST(
          FOR t IN txs
            SORT t.p.hash ASC
            RETURN t.p
        )
        RETURN tx
    )

    LET sortedTxs = (
      FOR t IN txs
        SORT t.hash ASC
        ${page}
        RETURN t
    )

    LET totalCount = LENGTH(txs)

    RETURN { totalCount, results: sortedTxs }
  `

  return await (await db.query(query)).next() as Data
}

const model = (ctx: Context) => {
  const ep = ctx.db.collection<EarningsPayment>('earningsPayments')

  return {
    init: async () => {
      if (!await ep.exists()) await ep.create()
    },
    find: arangosearch.find(ctx.db, ep),
    get: (key: string) => ep.document(key),
    insertMany: (ps: EarningsPayment[]) => ep.saveAll(ps.map(key), { returnNew: true }),
    search: arangosearch.search(ctx.db, ep),
    searchHighest: searchHighest(ctx)
  }
}

export default model
