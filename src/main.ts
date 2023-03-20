// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Log, LogLevelFromString, StdioAdaptor } from '@edge/log'

export type Config = {
  log: {
    level: string
  }
}

export type Context = {
  config: Config
  log: Log
}

const createLogger = ({ config }: Context) => {
  const log = new Log()
  log.use(new StdioAdaptor(true))
  log.setLogLevel(LogLevelFromString(config.log.level))
  return log
}

const main = async (config: Config) => {
  const ctx = <Context>{ config }

  ctx.log = createLogger(ctx)
  ctx.log.info('initialized logger')

  ctx.log.error('WIP')
}

export default main
