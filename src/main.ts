// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Database } from 'arangojs'
import api from './api'
import createJobs from './jobs'
import { cycle } from '@edge/misc-utils'
import { Log, LogLevelFromString, NewRelicAdaptor, StdioAdaptor } from '@edge/log'
import { Models, connectDatabase, initDatabase } from './db'
import { Payer, payer } from './payer'

export type Config = {
  arangodb: {
    url: string
    username: string
    password: string
    db: string
  }
  blockchain: {
    host: string
    sync: {
      enabled: boolean
      interval: number
      batchSize: number
      pageSize: number
    }
  }
  earnings: {
    host: string
    sync: {
      enabled: boolean
      interval: number
      pageSize: number
    }
  }
  funds: {
    distribution: number[]
    payer: {
      address: string
      privateKey: string
    }
  }
  http: {
    port: number
  }
  log: {
    level: string
  }
  network: string
  newrelic: {
    apiKey: string
    url: string
  }
  payout: {
    confirm: {
      enabled: boolean
      gracePeriod: number
      interval: number
      threshold: number
    }
    submit: {
      batchSize: number
      dryRun: boolean
      enabled: boolean
      interval: number
    }
  }
  startTime: number
  static: {
    path: string
  }
}

export type Context = {
  config: Config
  db: Database
  log: Log
  model: Models
  payer: Payer
}

const createLogger = ({ config }: Context) => {
  const log = new Log()
  log.use(new StdioAdaptor(true))
  if (config.newrelic.apiKey) {
    log.use(new NewRelicAdaptor(config.newrelic, { network: config.network, serviceType: 'lottery' }))
  }
  log.setLogLevel(LogLevelFromString(config.log.level))
  log.info('initialized logger')
  return log
}

const main = async (config: Config) => {
  const ctx = <Context>{ config }

  ctx.log = createLogger(ctx)

  ctx.db = await connectDatabase(ctx)
  ctx.model = await initDatabase(ctx)
  ctx.payer = payer(ctx)

  const jobs = createJobs(ctx)

  return new Promise((resolve, reject) => {
    cycle.run(jobs)
      .catch(reject)

    api(ctx).then(server => {
      server
        .on('error', err => ctx.log.error(err))
        .on('close', reject)
    })
    ctx.log.info('http listening', { port: config.http.port })
  })
}

export default main
