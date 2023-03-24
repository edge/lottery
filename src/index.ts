// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import dotenv from 'dotenv'
import main from './main'

dotenv.config()

const TRUE = ['1', 'on', 'yes', 'true']

main({
  arangodb: {
    url: process.env.ARANGODB_URL || 'http://localhost:8529',
    username: process.env.ARANGODB_USERNAME || 'root',
    password: process.env.ARANGODB_PASSWORD || 'root',
    db: process.env.ARANGODB_DATABASE || 'lottery'
  },
  blockchain: {
    host: process.env.BLOCKCHAIN_HOST || 'https://xe1.test.network',
    sync: {
      enabled:  TRUE.includes(process.env.BLOCKCHAIN_SYNC_ENABLED || 'yes'),
      interval: parseInt(process.env.BLOCKCHAIN_SYNC_INTERVAL || '60000'),
      batchSize: parseInt(process.env.BLOCKCHAIN_SYNC_BATCH_SIZE || '10'),
      pageSize: parseInt(process.env.BLOCKCHAIN_SYNC_PAGE_SIZE || '10')
    }
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
    distribution: process.env.FUNDS_DISTRIBUTION
      ? process.env.FUNDS_DISTRIBUTION.split(',').map(v => parseInt(v))
      : [10000 * 1e6, ...(new Array(10).fill(1000 * 1e6))],
    payer: {
      address: process.env.FUNDS_PAYER_ADDRESS || '',
      privateKey: process.env.FUNDS_PAYER_PRIVATE_KEY || ''
    }
  },
  http: {
    port: parseInt(process.env.HTTP_PORT || '8777')
  },
  log: {
    level: process.env.LOG_LEVEL || 'warn'
  },
  network: process.env.NETWORK || 'testnet',
  newrelic: {
    apiKey: process.env.NEWRELIC_API_KEY || '',
    url: process.env.NEWRELIC_URL || ''
  },
  payout: {
    confirm: {
      enabled: TRUE.includes(process.env.PAYOUT_CONFIRM_ENABLED || 'yes'),
      gracePeriod: parseInt(process.env.PAYOUT_CONFIRM_GRACE_PERIOD || '900000'),
      interval: parseInt(process.env.PAYOUT_CONFIRM_INTERVAL || '60000'),
      threshold: parseInt(process.env.PAYOUT_CONFIRM_THRESHOLD || '10')
    },
    submit: {
      batchSize: parseInt(process.env.PAYOUT_SUBMIT_BATCH_SIZE || '50'),
      dryRun: TRUE.includes(process.env.PAYOUT_SUBMIT_DRY_RUN || 'yes'),
      enabled: TRUE.includes(process.env.PAYOUT_SUBMIT_ENABLED || 'yes'),
      interval: parseInt(process.env.PAYOUT_SUBMIT_INTERVAL || '60000')
    }
  },
  startTime: process.env.START_TIME ? parseInt(process.env.START_TIME) : (new Date('2023-01-01')).getTime(),
  static: {
    path: process.env.STATIC_PATH || 'web/dist'
  }
})
