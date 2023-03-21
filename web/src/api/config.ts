import config from '@/config'
import superagent from 'superagent'
import type { RequestCallback } from '.'

export type Config = {
  funds: {
    distribution: number[]
  }
}

export const get = async (cb?: RequestCallback): Promise<Config> => {
  const url = `${config.api.host}/config`
  const req = superagent.get(url)
  const res = cb === undefined ? await req : await cb(req)
  return res.body
}
