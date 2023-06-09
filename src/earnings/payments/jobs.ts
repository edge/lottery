// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as lib from '../lib'
import { Context } from '../../main'
import { EarningsPayment } from './db'
import { isArangoError } from '../../db'

/**
 * Synchronise earnings payments from the Earnings Oracle, rather than directly from blockchain.
 * This route provides extra assurance that those payments are legitimate lottery candidates.
 */
export const sync = ({ config, model, log }: Context) => async () => {
  const latest = await model.earningsPayments.find(undefined, ['timestamp', 'DESC'])
  const sinceTimestamp = latest?.timestamp || config.startTime

  const data: lib.Payment[] = []

  const limit = config.earnings.sync.pageSize
  let offset = 0
  let fetch = true
  while (fetch) {
    const res = await lib.list(config.earnings.host, { status: 'confirmed', limit, offset, sinceTimestamp })
    log.debug('fetched payments', { count: res.metadata.count, limit, offset, sinceTimestamp })
    data.push(...res.results)
    offset += limit
    if (offset > res.metadata.totalCount) fetch = false
  }

  if (data.length === 0) return

  const payments: EarningsPayment[] = data.map(d => d.tx as EarningsPayment)
  const result = await model.earningsPayments.insertMany(payments)
  const errors = result.filter(isArangoError)
  errors.forEach(err => log.warn('failed to insert payment', { err }))
  log.info('synced payments', { sinceTimestamp, num: result.length - errors.length, errors: errors.length })
}
