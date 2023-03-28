// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import type { Payout } from './payouts'
import superagent from 'superagent'
import { type RequestCallback, toQueryString } from '.'

export type CreateRequest = {
  draw: Pick<Draw, 'winners'>
}

export type CreateResponse = {
  draw: Draw
}

export type GetDrawResponse = {
  draw: Draw
  payouts: Record<string, Payout>
}

export type ListDrawsParams = {
  limit?: number
  page?: number
  since?: number
  until?: number
}

export type ListDrawsResponse = {
  results: Draw[]
  metadata: {
    count: number
    limit: number
    skip: number
    terms?: Record<keyof ListDrawsParams, Record<string, string>>
    totalCount: number
  }
}

export type Draw = {
  _key: string
  timestamp: number
  winners: Winner[]
  highestHashes: Record<'hash' | 'recipient', string>[]
}

export type Winner = {
  amount: number
  hash: string
  recipient: string
}

export const create = async (
  host: string,
  data?: CreateRequest,
  cb?: RequestCallback
): Promise<CreateResponse> => {
  const url = `${host}/draws`
  const req = superagent.post(url).send(data)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}

export const get = async (
  host: string,
  key: string,
  cb?: RequestCallback
): Promise<GetDrawResponse> => {
  const url = `${host}/draws/${key}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}

export const list = async (
  host: string,
  params?: ListDrawsParams,
  cb?: RequestCallback
): Promise<ListDrawsResponse> => {
  let url = `${host}/draws`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
