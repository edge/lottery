import type * as xe from '@edge/xe-utils'
import type { SuperAgentRequest } from 'superagent'
import config from '@/config'
import superagent from 'superagent'

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

export type RequestCallback = (r: SuperAgentRequest) => SuperAgentRequest

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

// Transform any simple object into a query string for use in URLs.
export const toQueryString = (data: Record<string, unknown>): string => Object.keys(data)
  .map(key => `${key}=${urlsafe(data[key])}`)
  .join('&')

// Sanitize a value for use in URLs.
export const urlsafe = (v: unknown): string => {
  if (typeof v === 'string') return v.replace(/ /g, '%20')
  return `${v}`
}
