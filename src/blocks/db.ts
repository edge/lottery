// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xeSync from '@edge/xe-sync'
import { Context } from '../main'
import { Database, aql } from 'arangojs'
import { Key, isArangoError } from '../db'
import { find, search } from 'arangosearch'

/** Block identifiers for the XE blockchain. */
export type Block = xeSync.BlockID

/** Model for managing and searching blocks. */
export type BlocksModel = ReturnType<typeof model>

/** Delete all blocks above a given height (exclusive of that height). */
const deleteAbove = (db: Database) => async (above: number) => {
  const query = aql`
    FOR b IN ${db.collection('blocks')}
      FILTER b.height > ${above}
      REMOVE b IN ${db.collection('blocks')}
      COLLECT WITH COUNT INTO n
      RETURN n
  `
  return await(await db.query(query)).next() as number
}

/** Set the ArangoDB `_key` for a block. */
const key = (b: Partial<Key> & Block) => {
  b._key = b.hash
  return b as Key & Block
}

/** Create a blocks model. */
const model = ({ db, log }: Context) => {
  const blocks = db.collection<Block>('blocks')

  const blocksModel = {
    countAll: () => blocks.count().then(c => c.count),
    deleteAbove: deleteAbove(db),
    empty: () => blocks.truncate(),
    find: find(db, blocks),
    get: (hash: string) => blocks.document(hash),
    index: async (bs: Block[]) => {
      const result = await blocksModel.insertMany(bs.map(b => ({ hash: b.hash, height: b.height })))
      const errors = result.filter(isArangoError)
      errors.forEach(err => log.error('error indexing block', { err }))
      log.info('indexed blocks', { num: result.length - errors.length, errors: errors.length })
      if (errors.length) {
        throw new Error('encountered errors during block indexing')
      }
    },
    init: async () => {
      if (!await blocks.exists()) await db.createCollection('blocks')
      await blocks.ensureIndex({
        type: 'persistent',
        fields: ['height'],
        name: 'block_height'
      })
    },
    insertMany: (bs: Block[]) => blocks.saveAll(bs.map(key), { overwriteMode: 'replace' }),
    search: search(db, blocks),
    tip: () => find(db, blocks)(undefined, ['height', 'DESC'])
  }
  return blocksModel
}

export default model
