import * as xe from '@edge/xe-utils'
import { toQueryString } from '../lib'
import superagent, { SuperAgentRequest } from 'superagent'

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

export type Payment = {
  ref: string
  start: number
  end: number
  status: PaymentStatus
  attempts: number
  lastResponse?: string
  tx: Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>>
}

export type PaymentStatus = 'unsent' | 'pending' | 'processed' | 'confirmed'

/**
 * Callback function allowing a SuperAgent HTTP request to be modified before it is sent.
 * For example, you may want to specify a 100ms request timeout while fetching transactions:
 *
 * ```
 * const txs = await tx.transactions('https://api.xe.network', undefined, r => r.timeout(100))
 * ```
 *
 * This approach enables user code to alter request behaviour using SuperAgent's API:
 * https://visionmedia.github.io/superagent/
 */
export type RequestCallback = (r: SuperAgentRequest) => SuperAgentRequest

export const list = async (host: string, params?: ListParams, cb?: RequestCallback): Promise<ListResponse> => {
  let url = `${host}/payments`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
