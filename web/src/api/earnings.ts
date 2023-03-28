// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import type * as xe from '@edge/xe-utils'
import superagent from 'superagent'
import { type RequestCallback, toQueryString } from '.'

export type ListPaymentsParams = {
  hash?: string
  limit?: number
  page?: number
  recipient?: string
  sender?: string
  since?: number
  until?: number
}

export type ListPaymentsResponse = {
  results: Payment[]
  metadata: {
    count: number
    limit: number
    skip: number
    terms?: Record<keyof ListPaymentsParams, Record<string, string>>
    totalCount: number
  }
}

export type Payment = xe.tx.Tx

export const listPayments = async (
  host: string,
  params?: ListPaymentsParams,
  cb?: RequestCallback
): Promise<ListPaymentsResponse> => {
  let url = `${host}/earnings/payments`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}

export const listHighestPayments = async (
  host: string,
  params?: Partial<Record<'limit' | 'page' | 'skip', number>>,
  cb?: RequestCallback
): Promise<ListPaymentsResponse> => {
  let url = `${host}/earnings/payments/highest`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
