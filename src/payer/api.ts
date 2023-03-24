// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from '../main'
import { RequestHandler } from 'express'

export const get = ({ payer }: Context): RequestHandler => async (req, res, next) => {
  try {
    const info = await payer.get()
    res.json({
      payer: {
        address: info.address,
        balance: info.balance,
        nonce: info.nonce
      }
    })
    next()
  }
  catch (err) {
    next(err)
  }
}
