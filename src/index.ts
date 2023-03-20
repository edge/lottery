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
  log: {
    level: process.env.LOG_LEVEL || 'warn'
  }
})
