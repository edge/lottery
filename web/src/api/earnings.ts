import type * as xe from '@edge/xe-utils'
import config from '@/config'
import superagent from 'superagent'
import { toQueryString, type RequestCallback } from '.'

export type ListPaymentsParams = {
  hash?: string
  limit?: number
  page?: number
  recipient?: string
  sender?: string
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
  params?: ListPaymentsParams,
  cb?: RequestCallback
): Promise<ListPaymentsResponse> => {
  let url = `${config.api.host}/earnings/payments`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
