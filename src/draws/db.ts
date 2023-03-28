// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from '../main'
import { EarningsPayment } from '../earnings/payments/db'
import arangosearch from 'arangosearch'
import { newDoc } from '../db'

/** Model for managing and searching draws. */
export type DrawsModel = ReturnType<typeof model>

/** A draw represents a set of lottery winners at a given time. */
export type Draw = {
  timestamp: number
  winners: Winner[]
  highestHashes: Pick<EarningsPayment, 'hash' | 'recipient'>[]
}

/** Lottery winner, with reference to the winning transaction hash. */
export type Winner = Pick<EarningsPayment, 'amount' | 'hash' | 'recipient'>

/** Create a draws model. */
const model = (ctx: Context) => {
  const r = ctx.db.collection<Draw>('draws')

  return {
    init: async () => {
      if (!await r.exists()) await r.create()
    },
    find: arangosearch.find(ctx.db, r),
    get: (key: string) => r.document(key),
    insert: (d: Draw) => r.save(d, { returnNew: true }).then(newDoc),
    search: arangosearch.search(ctx.db, r)
  }
}

export default model
