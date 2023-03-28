// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import type * as xe from '@edge/xe-utils'

export type Payout = {
  attempts?: number
  lastResponse?: string
  draw: string
  status: PayoutStatus
  tx: PayoutTx
  block?: Pick<xe.block.Block, 'hash' | 'height'>
}

export type PayoutTx = Omit<xe.tx.Tx, 'hash' | 'signature'> &
  Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>> & {
    data: xe.tx.TxData & {
      ref: string
    }
  }

export type PayoutStatus = 'unsent' | 'pending' | 'processing' | 'confirmed'
