// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import dotenv from 'dotenv'
import main from './main'

dotenv.config()

main({
  arangodb: {
    url: process.env.ARANGODB_URL || 'http://localhost:8529',
    username: process.env.ARANGODB_USERNAME || 'root',
    password: process.env.ARANGODB_PASSWORD || 'root',
    db: process.env.ARANGODB_DATABASE || 'lottery'
  },
  earnings: {
    host: process.env.EARNINGS_HOST || 'https://earnings.test.network',
    sync: {
      enabled: true,
      interval: parseInt(process.env.EARNINGS_SYNC_INTERVAL || '60000'),
      pageSize: parseInt(process.env.EARNINGS_SYNC_PAGE_SIZE || '100')
    }
  },
  funds: {
    distribution: [
      10000 * 1e6,
      ...(new Array(10).fill(1000 * 1e6))
    ]
  },
  http: {
    port: parseInt(process.env.HTTP_PORT || '8777')
  },
  log: {
    level: process.env.LOG_LEVEL || 'warn'
  },
  startTime: process.env.START_TIME ? parseInt(process.env.START_TIME) : (new Date('2023-01-01')).getTime()
})
