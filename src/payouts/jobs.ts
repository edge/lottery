// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { Context } from '../main'
import { Key, Update, isArangoError } from '../db'
import { Payout, PayoutTx } from './db'

/** Confirm lottery payouts on the blockchain. */
export const confirm = ({ config, model, log }: Context) => async () => {
  const tip = await model.blocks.tip()
  if (tip === undefined) {
    log.error('unable to confirm transactions without a tip block')
    return
  }

  const threshold = tip.height - config.payout.confirm.threshold
  const expired = tip.height - config.payout.confirm.graceBlocks

  const [count, payouts] = await model.payouts.search({
    status: { in: ['pending', 'processing'] },
    block: { height: { mode: 'OR', neq: null, lte: threshold }}
  })
  if (count === 0) return

  const updates: Update<Payout>[] = []

  payouts.filter(u => u.status).forEach(p => {
    if (p.status === 'processing' && (p.block?.height || tip.height) <= threshold) {
      // payout is processing and past confirmation threshold, move to confirmed
      updates.push({ _key: p._key, status: 'confirmed' })
    }
    else if ((p.submitBlock?.height || 0) < expired) {
      // payout has expired without processing, move back to unsent
      updates.push({ _key: p._key, status: 'unsent' })
    }
  })

  if (updates.length === 0) return

  const results = await model.payouts.updateMany(updates)
  const errors = results.filter(isArangoError)
  errors.forEach(err => log.error('error saving payouts', { err }))
  log.info('updated payouts', { num: results.length - errors.length, errors: errors.length })
}

/** Submit lottery payouts to the blockchain. */
export const submit = ({ config, model, payer, log }: Context) => async () => {
  const [, ps] = await model.payouts.search({ status: { eq: 'unsent' } }, [config.payout.submit.batchSize])
  if (ps.length === 0) {
    log.info('no transactions')
    return
  }
  const tip = await model.blocks.tip()
  if (tip === undefined) {
    log.error('refusing to submit transactions without a tip block')
    return
  }
  log.info('submitting transactions', { num: ps.length })

  const signed: (Key & Payout)[] = []
  const info = await payer.refresh()
  ps.forEach((p, i) => {
    p.tx.timestamp = Date.now()
    p.tx.nonce = info.nonce + i
    p.tx.sender = config.funds.payer.address
    const tx = xe.tx.sign(p.tx, config.funds.payer.privateKey) as PayoutTx
    signed.push({
      ...p,
      tx: { ...tx }
    })
  })

  if (config.payout.submit.dryRun) {
    log.warn('dry run: transactions not submitted', { signed })
    return
  }

  const response = await xe.tx.createTransactions(config.blockchain.host.find(Boolean) as string, signed.map(t => t.tx as xe.tx.SignedTx))
  if (response.metadata.rejected) {
    const failed = response.results.filter(r => !r.success).map(r => r.transaction.data.ref)
    log.error('some transactions failed', { ...response.metadata, failed })
  }
  else if (response.metadata.ignored) {
    log.error('some transactions were ignored', response.metadata)
  }
  else {
    log.info('submitted transactions', response.metadata)
  }

  const updates: Update<Payout>[] = []
  response.results.forEach(rcpt => {
    const p = signed.find(s => s.tx.data.ref === rcpt.transaction.data.ref) as Key & Payout
    p.attempts = 1 + (p.attempts || 0)
    p.submitBlock = { hash: tip.hash, height: tip.height }
    if (rcpt.success) {
      p.status = 'pending'
      p.lastResponse = ''
    }
    else {
      p.status = 'unsent'
      p.lastResponse = rcpt.reason
    }
    updates.push(p)
  })

  const results = await model.payouts.updateMany(updates)
  const errors = results.filter(isArangoError)
  errors.forEach(err => {
    log.error('error saving payment', { err })
  })
  log.info('updated transaction statuses', { num: updates.length - errors.length, errors: errors.length })
}
