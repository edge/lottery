// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as cycle from './cycle'
import * as earningsPayment from './earnings/payment/jobs'
import { Context } from './main'
import { Log } from '@edge/log'
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
    if (ctx.config.earnings.sync.enabled) return createJob(
      ctx,
      'earnings:payment:sync',
      ctx.config.earnings.sync.interval,
      earningsPayment.sync
    )
  }
]

/**
 * Initialise background jobs.
 */
export default (ctx: Context) => setups.map(setup => setup(ctx)).filter(Boolean) as cycle.Job[]
