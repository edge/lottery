// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import type { RequestCallback } from '.'
import superagent from 'superagent'

export type Config = {
  funds: {
    distribution: number[]
  }
  nextDraw: {
    since: number
  }
}

export const get = async (host: string, cb?: RequestCallback): Promise<Config> => {
  const url = `${host}/config`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
