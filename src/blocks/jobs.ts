// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Block } from './db'
import { Context } from '../main'
import xeSync, { FetchResponse, NextFn, RollbackFn } from '@edge/xe-sync'

const getRollback = ({ model, ...ctx }: Context): RollbackFn => {
  const log = ctx.log.extend('rollback')

  return async r => {
    const { localBlock, remoteBlock } = r
    log.info('starting rollback', { localBlock, remoteBlock })
    let match: Block | undefined = undefined
    try {
      match = await model.blocks.find(
        { hash: { in: r.blocks.map(b => b.hash) }},
        ['height', 'DESC']
      )
      let next: NextFn | undefined = r.next
      while (match === undefined) {
        if (next === undefined) {
          throw new Error('exhausted blockchain history')
        }
        const response = await next()
        match = await model.blocks.find(
          { hash: { in: response.blocks.map(b => b.hash) }},
          ['height', 'DESC']
        )
        next = response.next
      }
    }
    catch (err) {
      log.error('error finding common block', { err, localBlock, remoteBlock })
      throw err
    }
    log.debug('found common block', { match })

    try {
      await model.blocks.deleteAbove(match.height)

    }
    catch (err) {
      log.error('rollback failed', { err, oldTip: r.localBlock, newTip: match })
      throw err
    }
    log.info('completed rollback', { from: r.localBlock.height, to: match.height })

    return match
  }
}

/**
 * Synchronise blockchain.
 * Refer to various models' `index()` methods for the specifics of their indexing behaviour.
 */
export const sync = (ctx: Context) => {
  const { config, log, model } = ctx
  const rollback = getRollback({ ...ctx, log: log.extend('rollback') })

  return async () => {
    let next: NextFn | undefined = () => xeSync({
      host: [...config.blockchain.host],
      hostSelection: config.blockchain.hostSelection,
      limit: config.blockchain.sync.batchSize,
      pageSize: config.blockchain.sync.pageSize,
      tip: model.blocks.tip,
      requestCallback: r => {
        log.trace('querying blockchain', { url: r.url })
        return r
      },
      rollback
    })
    while (next !== undefined) {
      const result: FetchResponse = await next()
      if (result.blocks.length === 0) {
        log.info('no new blocks')
        break
      }
      const from = result.blocks.reduce((a, b) => a.height > b.height ? b : a).height
      const to = result.blocks.reduce((a, b) => a.height > b.height ? a : b).height
      log.info('fetched blocks', { from, to })

      // index payout transactions
      if (result.transactions.length > 0) {
        await model.payouts.index(result.transactions)
      }

      // index blocks
      await model.blocks.index(result.blocks)

      next = result.next
    }

    log.info('done')
  }
}
