import type { SuperAgentRequest } from 'superagent'

export type RequestCallback = (r: SuperAgentRequest) => SuperAgentRequest

// Transform any simple object into a query string for use in URLs.
export const toQueryString = (data: Record<string, unknown>): string => Object.keys(data)
  .map(key => `${key}=${urlsafe(data[key])}`)
  .join('&')

// Sanitize a value for use in URLs.
export const urlsafe = (v: unknown): string => {
  if (typeof v === 'string') return v.replace(/ /g, '%20')
  return `${v}`
}
