// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { ParsedQs } from 'qs'
import { Direction, Searchable, Sort } from 'arangosearch'

export const array = (param: unknown): string[] => {
  if (param instanceof Array) return param
  if (typeof param === 'string') return [param]
  return []
}

export const bool = (param: unknown, def?: boolean): boolean | undefined => {
  if (typeof param !== 'string') return def
  if (param === '1') return true
  if (param === '0') return false
  return def
}

export const numeric = (param: unknown, min?: number, max?: number) => {
  if (typeof param !== 'string') return undefined
  let n = parseInt(param)
  if (isNaN(n)) return undefined
  if (min !== undefined) n = Math.max(n, min)
  if (max !== undefined) n = Math.min(n, max)
  return n
}

export const str = (param: unknown) => typeof param === 'string' ? param : undefined

const sortRegexp = /^-?[a-zA-Z0-9.]+$/

export const sortsArray = <T extends Searchable>(input: string[], allow: (keyof T)[]): Sort<T>[] | undefined => {
  const sorts = input
    .filter(v => sortRegexp.test(v))
    .map<[keyof T, Direction]>(v => v[0] === '-' ? [v.slice(1), 'DESC'] : [v, 'ASC'])
    .filter(([prop]) => allow.includes(prop))
  return sorts.length ? sorts : undefined
}

export const sortsStr = <T extends Searchable>(input: string | undefined, allow: (keyof T)[]): Sort<T>[] | undefined =>
  !input ? undefined : sortsArray(input.split(','), allow)

/** Do not use in v2 APIs - this just provides greater compatibility within v1 */
export const sorts = <T extends Searchable>(
  input: undefined | string | string[] | ParsedQs | ParsedQs[],
  def: Sort<T> | undefined,
  allow: (keyof T)[]
): Sort<T>[] | undefined => {
  if (typeof input === 'string') return sortsStr(input, allow)
  if (input instanceof Array) return sortsArray(input.map(v => v).filter(v => typeof v === 'string') as string[], allow)
  return def && [def]
}
