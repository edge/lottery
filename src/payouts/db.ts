// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import arangosearch from 'arangosearch'
import { BlockID, BlockTx } from '@edge/xe-sync'
import { Key, Update, isArangoError } from '../db'

/** Model for managing and searching lottery payouts. */
export type PayoutsModel = ReturnType<typeof model>

/** Lottery payout. */
export type Payout = {
  attempts?: number
  lastResponse?: string
  draw: string
  status: PayoutStatus
  tx: PayoutTx
  block?: BlockID
}

/**
 * Lottery payout transaction.
 * Essentially just a blockchain transaction but `data.ref` is required, which should contain the hash of the winning
 * transaction to which it pertains.
 */
export type PayoutTx = Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>> & {
  data: xe.tx.TxData & {
    ref: string
  }
}

/** Payout status in blockchain. */
export type PayoutStatus = 'unsent' | 'pending' | 'processing' | 'confirmed'

/**
 * Add ArangoDB `_key` to a payout.
 * The winning transaction hash (as `tx.data.ref`) is used as the key for cross-referential purposes.
 * Be mindful that the payout transaction's own hash (`tx.hash`) is different.
 */
const key = (p: Payout): Key & Payout => ({ ...p, _key: p.tx.data.ref })

/** Create a lottery payouts model. */
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

      const updates: Update<Payout>[] = []
      payouts.forEach(p => {
        const tx = txs.find(tx => tx.tx.data.ref === p._key)
        if (!tx) {
          ctx.log.error('unexpected missing tx', { ref: p._key })
          return
        }
        if (tx.tx.sender !== p.tx.sender) {
          ctx.log.debug('skipped transaction - incorrect sender', { hash: tx.tx.hash, ref: p._key })
          return
        }
        if (tx.tx.timestamp !== p.tx.timestamp) {
          ctx.log.debug('skipped transaction - incorrect timestamp', { hash: tx.tx.hash, ref: p._key })
        }
        updates.push({
          _key: p._key,
          tx: {
            hash: tx.tx.hash
          },
          block: tx.block,
          status: 'processing'
        })
      })
      if (updates.length === 0) return

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
