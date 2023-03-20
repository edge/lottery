// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { clearInterval, setInterval } from 'timers'

export type DoFn = () => Promise<void>

export type Duration = number

export type ErrorFn = (job: JobInfo, err: unknown) => void

export type InfoFn = (job: JobInfo) => void

export type Job = {
  do: DoFn
  name: string
  interval: number
  defer?: number
  status?: Status
}

export type JobInfo = Pick<Job, 'name' | 'status'>

export type Status = 'error' | 'pending' | 'running' | undefined

// wrap the job's basic DoFn behaviour with status management, error handling, and callbacks.
// this step is not -required- for use in a cycle but it's a recommended pattern!
export const prepare = (job: Job, before?: InfoFn, after?: InfoFn, onError?: ErrorFn): DoFn => {
  const doJob = job.do
  return async (): Promise<void> => {
    if (job.status === 'running') {
      const err = new Error('previous execution has not completed')
      err.name = 'PreviousExecutionNotCompleteError'
      onError && onError(job, err)
      return
    }

    before && before(job)
    job.status = 'running'
    try {
      await doJob()
      job.status = 'pending'
      after && after(job)
    }
    catch (err) {
      job.status = 'error'
      onError && onError(job, err)
    }
  }
}

// run any number of jobs in concert. if one job fails, all job intervals are cancelled.
// the returned promise will never resolve; it can only fail (although in practice it won't do that either).
export const run = (jobs: Job[]): Promise<void> => new Promise((_resolve, reject) => {
  const timeouts: NodeJS.Timeout[] = []
  const fail = (err: unknown) => {
    timeouts.forEach(clearInterval)
    reject(err)
  }

  jobs
    .map(job => ({ ...job, status: 'pending' }))
    .forEach(job => {
      const startJob = () => {
        const tick = () => job.do().catch(fail)
        timeouts.push(setInterval(tick, job.interval))
        tick()
      }
      if (job.defer) setTimeout(startJob, job.defer)
      else startJob()
    })
})

export const sequence = (...doFns: DoFn[]): DoFn => async () => {
  for (let i = 0; i < doFns.length; i++) {
    await doFns[i]()
  }
}
