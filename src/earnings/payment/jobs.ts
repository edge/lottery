import * as lib from '../lib'
import { Context } from '../../main'
import { EarningsPayment } from './db'
import { isArangoError } from '../../db'

export const sync = ({ config, model, log }: Context) => async () => {
  const latest = await model.earningsPayment.find(undefined, ['timestamp', 'DESC'])
  const since = latest?.timestamp || config.startTime

  const data: lib.Payment[] = []

  const limit = config.earnings.sync.pageSize
  let offset = 0
  let fetch = true
  while (fetch) {
    const res = await lib.list(config.earnings.host, { status: 'confirmed', limit, offset, since })
    data.push(...res.results)
    offset += limit
    if (offset > res.metadata.totalCount) fetch = false
    log.debug('fetched payments', { count: res.metadata.count, limit, offset, since })
  }

  const payments: EarningsPayment[] = data.map(d => d.tx as EarningsPayment)
  const result = await model.earningsPayment.insertMany(payments)
  const errors = result.filter(isArangoError)
  errors.forEach(err => log.warn('failed to insert payment', { err }))
  log.info('synced payments', { since, num: result.length - errors.length, errors: errors.length })
}
