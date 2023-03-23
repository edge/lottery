import type { RequestCallback } from '.'
import superagent from 'superagent'

export type CreateRequest = {
  release: Pick<Release, 'winners'>
}

export type CreateResponse = {
  release: Release
}

export type Release = {
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
