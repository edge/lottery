// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { DocumentMetadata } from 'arangojs/documents'
import { Draw } from './db'

export const present = (d: Partial<DocumentMetadata> & Draw) => ({
  _key: d._key,
  timestamp: d.timestamp,
  winners: d.winners,
  highestHashes: d.highestHashes
})
