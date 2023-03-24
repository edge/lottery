// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { Context } from '../main'

export type Payer = ReturnType<typeof payer>

export const payer = ({ config }: Context) => {
  let info: xe.wallet.WalletInfo | undefined

  const refresh = async () => {
    info = await xe.wallet.infoWithNextNonce(config.blockchain.host, config.funds.payer.address)
    return info
  }

  const get = () => info === undefined ? refresh() : info

  return { get, refresh }
}
