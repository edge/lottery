// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import dotenv from 'dotenv'
import main from './main'

dotenv.config()

main({
  log: {
    level: process.env.LOG_LEVEL || 'warn'
  }
})
