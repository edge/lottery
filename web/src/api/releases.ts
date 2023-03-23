import type { Payout } from './payouts'
import superagent from 'superagent'
import { type RequestCallback, toQueryString } from '.'

export type CreateRequest = {
  release: Pick<Release, 'winners'>
}

export type CreateResponse = {
  release: Release
}

export type GetReleaseResponse = {
  release: Release
  payouts: Record<string, Payout>
}

export type ListReleasesParams = {
  limit?: number
  page?: number
  since?: number
  until?: number
}

export type ListReleasesResponse = {
  results: Release[]
  metadata: {
    count: number
    limit: number
    skip: number
    terms?: Record<keyof ListReleasesParams, Record<string, string>>
    totalCount: number
  }
}

export type Release = {
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
  const url = `${host}/releases`
  const req = superagent.post(url).send(data)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}

export const get = async (
  host: string,
  key: string,
  cb?: RequestCallback
): Promise<GetReleaseResponse> => {
  const url = `${host}/releases/${key}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}

export const list = async (
  host: string,
  params?: ListReleasesParams,
  cb?: RequestCallback
): Promise<ListReleasesResponse> => {
  let url = `${host}/releases`
  if (params) url += `?${toQueryString(params)}`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
