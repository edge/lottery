// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as blocks from './blocks/jobs'
import * as earningsPayments from './earnings/payments/jobs'
import * as payouts from './payouts/jobs'
import { Context } from './main'
import { Log } from '@edge/log'
import { cycle } from '@edge/misc-utils'
import { omit } from 'lodash'

type JobSetup = (ctx: Context) => cycle.Job | undefined

const before = (log: Log): cycle.InfoFn => info => log.trace('starting', omit(info, ['name']))
const after = (log: Log): cycle.InfoFn => info => log.trace('completed', omit(info, ['name']))

const onError = (log: Log, blocking = false): cycle.ErrorFn => (info, err) => {
  log.error('failed', { ...omit(info, ['name']), err })
  if (blocking) throw err
}

const createJob = (
  ctx: Context,
  name: string,
  interval: number,
  setupFn: (ctx: Context) => cycle.DoFn,
  blocking = false
): cycle.Job => {
  const log = ctx.log.extend(name)
  const job = { name, interval, do: setupFn({ ...ctx, log }) }
  job.do = cycle.prepare(job, before(log), after(log), onError(log, blocking))
  return job
}

const setups: JobSetup[] = [
  ctx => {
    if (ctx.config.blockchain.sync.enabled) return createJob(
      ctx,
      'blockchain:sync',
      ctx.config.blockchain.sync.interval,
      blocks.sync
    )
  },
  ctx => {
    if (ctx.config.earnings.sync.enabled) return createJob(
      ctx,
      'earnings:payment:sync',
      ctx.config.earnings.sync.interval,
      earningsPayments.sync
    )
  },
  ctx => {
    if (ctx.config.payout.submit.enabled) return createJob(
      ctx,
      'payout:submit:sync',
      ctx.config.payout.submit.interval,
      payouts.submit
    )
  },
  ctx => {
    if (ctx.config.payout.confirm.enabled) return createJob(
      ctx,
      'payout:confirm:sync',
      ctx.config.payout.confirm.interval,
      payouts.confirm
    )
  }
]

/**
 * Initialise background jobs.
 */
export default (ctx: Context) => setups.map(setup => setup(ctx)).filter(Boolean) as cycle.Job[]
