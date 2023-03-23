import superagent from 'superagent'
import type { RequestCallback } from '.'

export type Config = {
  funds: {
    distribution: number[]
  }
  nextRelease: {
    since: number
  }
}

export const get = async (host: string, cb?: RequestCallback): Promise<Config> => {
  const url = `${host}/config`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
