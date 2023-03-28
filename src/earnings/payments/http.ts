// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { EarningsPayment } from './db'

/** Present an earnings payment safely through API. */
export const present = (p: EarningsPayment) => ({
  sender: p.sender,
  recipient: p.recipient,
  amount: p.amount,
  nonce: p.nonce,
  data: p.data,
  hash: p.hash,
  signature: p.signature
})
