// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from './main'
import { Database } from 'arangojs'
import { DeepPartial } from './lib'
import { Searchable } from 'arangosearch'
import { omit } from 'lodash'
import { Document, DocumentMetadata } from 'arangojs/documents'
import blocks, { BlocksModel } from './blocks/db'
import earningsPayments, { EarningsPaymentsModel } from './earnings/payments/db'
import payouts, { PayoutsModel } from './payouts/db'
import releases, { ReleasesModel } from './releases/db'

/** Record with ArangoDB _key. */
export type Key = Pick<DocumentMetadata, '_key'>

export type Models = {
  blocks: BlocksModel
  earningsPayments: EarningsPaymentsModel
  payouts: PayoutsModel
  releases: ReleasesModel
}

/**
 * Timestamps can be maintained on any database record using the `touch()` convenience function.
 *
 * The type signature permits unset timestamp data only for convenience writing database update code.
 * Any record type that extends `Timestamps` **should** have these values set by the corresponding database model.
 */
export type Timestamps = {
  /** Created timestamp */
  created?: number
  /** Last updated timestamp */
  updated?: number
}

export type Update<T> = Key & DeepPartial<T>

/** ArangoDB internal data properties. */
export const arangoInternals = ['_key', '_id', '_rev']

/** ArangoDB 'private' data properties (for purposes of this application). */
export const arangoPrivateInternals = ['_id', '_rev']

/**
 * Create [ArangoDB] database connection.
 */
export const connectDatabase = async ({ config, log }: Context) => {
  const db = new Database({
    url: config.arangodb.url,
    auth: {
      username: config.arangodb.username,
      password: config.arangodb.password
    }
  })
  if (!await db.database(config.arangodb.db).exists()) {
    await db.createDatabase(config.arangodb.db)
    log.info('created database', { url: config.arangodb.url, db: config.arangodb.db })
  }
  log.info('connected to database', { url: config.arangodb.url, db: config.arangodb.db })
  return db.database(config.arangodb.db)
}

const createModels = (ctx: Context): Models => ({
  blocks: blocks(ctx),
  earningsPayments: earningsPayments(ctx),
  payouts: payouts(ctx),
  releases: releases(ctx)
})

/**
 * Initialise database by automatically creating collections, migrating data etc.
 */
export const initDatabase = (ctx: Context) => new Promise<Models>((resolve, reject) => {
  const models = createModels(ctx)
  const initFuncs: (() => Promise<unknown>)[] = Object.values(models).map(m => m.init)
  let wg = initFuncs.length
  initFuncs.forEach(async f => {
    try {
      await f()
      wg--
    }
    catch (err) {
      return reject(err)
    }
    finally {
      if (wg === 0) {
        ctx.log.info('initialised database schema')
        resolve(models)
      }
    }
  })
})

/**
 * Based on arangojs `isArangoErrorResponse()` which is not exported:
 * https://github.com/arangodb/arangojs/blob/e52675019a665ea468773bdf0642e7c03c6032ad/src/error.ts#L77-L90
 *
 * Determines whether any data response is an ArangoError or *looks like* an Arango error response.
 * This is useful for e.g. bulk insert, where a single write fail doesn't cause an Error to be thrown.
 */
export const isArangoError = (data: unknown) =>
  typeof data === 'object' &&
  !(data instanceof Array) &&
  data !== null &&
  (data instanceof Error && data.name === 'ArangoError' || Boolean((data as { error: string }).error))

/**
 * Determines whether any data response looks like an Arango 'document not found' error.
 */
export const isArangoNotFound = (data: unknown) =>
  isArangoError(data) &&
  (data as Error).message === 'document not found'

/**
 * Retrieve new document from an ArangoDB response, e.g. save.
 * The database transaction **must** provide a `returnNew: true` option to support this type definition.
 */
export const newDoc = <T extends Searchable>(doc: DocumentMetadata & { new?: Document<T> }) => doc.new as Document<T>

/**
 * Retrieve old document from an ArangoDB response, e.g. save or remove.
 * The database transaction **must** provide a `returnOld: true` option to support this type definition.
 */
export const oldDoc = <T extends Searchable>(doc: DocumentMetadata & { old?: Document<T> }) => doc.old as Document<T>

/** Omit ArangoDB internals from a data object. */
export const omitArangoInternals = (r: Record<string, unknown>) => omit(r, arangoInternals)

/** Omit ArangoDB 'private' properties from a data object. */
export const omitArangoPrivate = (r: Record<string, unknown>) => omit(r, arangoPrivateInternals)

/**
 * Touch a timestamped database record, refreshing its updated timestamp.
 *
 * Pass `true` as the second argument to also touch the created timestamp, if one isn't already set.
 * If a number is passed it is ignored, allowing `Array.map(touch)` functional-style usage.
 */
export const touch = <T extends Timestamps>(data: T, created: number | boolean = false): T => {
  const now = Date.now()
  if (created === true && !data.created) data.created = now
  data.updated = now
  return data
}
