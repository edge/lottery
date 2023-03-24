// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { toQueryString } from '../lib'
import superagent, { SuperAgentRequest } from 'superagent'

/** Query parameters for earnings payments request. */
export type ListParams = {
  limit?: number
  maxAttempts?: number
  minAttempts?: number
  offset?: number
  recipient?: string
  since?: number
  status?: PaymentStatus
  until?: number
}

/** Earnings payments response from Earnings Oracle. */
export type ListResponse = {
  results: Payment[]
  metadata: {
    count: number
    limit: number
    maxAttempts?: number
    minAttempts?: number
    offset: number
    recipient?: number
    since?: number
    status?: PaymentStatus
    totalCount: number
    until?: number
  }
}

/**
 * Payment type in Earnings Oracle.
 * Includes some additional metadata not used in lottery code.
 */
export type Payment = {
  ref: string
  start: number
  end: number
  status: PaymentStatus
  attempts: number
  lastResponse?: string
  tx: Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>>
}

/** Payment statuses in Earnings Oracle. */
export type PaymentStatus = 'unsent' | 'pending' | 'processed' | 'confirmed'

/** Callback function allowing a SuperAgent HTTP request to be modified before it is sent. */
export type RequestCallback = (r: SuperAgentRequest) => SuperAgentRequest

/** Retrieve a list of earnings payments from Earnings Oracle. */
export const list = async (host: string, params?: ListParams, cb?: RequestCallback): Promise<ListResponse> => {
  let url = `${host}/payments`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
