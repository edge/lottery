// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import type * as xe from '@edge/xe-utils'
import type { RequestCallback } from '.'
import superagent from 'superagent'

export type Payer = Pick<xe.wallet.WalletInfo, 'address' | 'balance' | 'nonce'>

export type GetPayerResponse = {
  payer: Payer
}

export const get = async (host: string, cb?: RequestCallback): Promise<GetPayerResponse> => {
  const url = `${host}/payer`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
