// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Payout } from './db'

export const present = (p: Payout) => ({
  draw: p.draw,
  status: p.status,
  tx: {
    sender: p.tx.sender,
    recipient: p.tx.recipient,
    amount: p.tx.amount,
    nonce: p.tx.nonce,
    data: p.tx.data,
    hash: p.tx.hash,
    signature: p.tx.signature
  }
})
