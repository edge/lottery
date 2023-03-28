// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as draws from './draws/api'
import * as earningsPayments from './earnings/payments/api'
import * as payer from './payer/api'
import { Context } from './main'
import Package from '../package.json'
import cors from 'cors'
import { sep } from 'path'
import express, { ErrorRequestHandler, RequestHandler } from 'express'
import { readFile, stat } from 'fs/promises'

/** Configuration API. */
const config = ({ config, model }: Context): RequestHandler => async (req, res, next) => {
  try {
    const lastDraw = await model.draws.find(undefined, ['timestamp', 'DESC'])
    const since = lastDraw?.timestamp || config.startTime

    res.json({
      funds: {
        distribution: config.funds.distribution
      },
      nextDraw: {
        since
      }
    })
    next()
  }
  catch (err) {
    return next(err)
  }
}

/**
 * Final error handler.
 * Logs any unhandled error and ensures the response is a safe 500 Internal Server Error, if not already sent.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const finalError = (ctx: Context): ErrorRequestHandler => (err, req, res, next) => {
  ctx.log.error(`${req.method} ${req.url}`, { err })
  if (res.headersSent) return
  res.status(500).json({ error: 'internal server error' })
}

/** Final handler for requests not matched. */
const finalNotFound: RequestHandler = (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ error: 'no route' })
  }
  next()
}

const version: RequestHandler = (req, res, next) => {
  res.json({
    name: 'lottery',
    version: Package.version
  })
  next()
}

/**
 * Initialise and run HTTP API.
 */
export default async (ctx: Context) => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/config', config(ctx))
  app.get('/api/payer', payer.get(ctx))
  app.get('/api/version', version)

  app.post('/api/draws', draws.create(ctx))
  app.get('/api/draws', draws.list(ctx))
  app.get('/api/draws/:key', draws.get(ctx))

  app.get('/api/earnings/payments', earningsPayments.list(ctx))
  app.get('/api/earnings/payments/highest', earningsPayments.listHighest(ctx))

  // static content fallback for admin pwa, including forwarding to index
  const fileRegexp = /\.[a-zA-Z]*$/
  try {
    const info = await stat(ctx.config.static.path)
    if (info.isDirectory()) {
      const indexHtml = await readFile(`${ctx.config.static.path}${sep}index.html`)
      app.use(express.static(ctx.config.static.path))
      app.use((req, res, next) => {
        if (res.headersSent) return next()
        if (req.headers['content-type'] !== 'application/json' && !fileRegexp.test(req.path)) {
          res.header('Content-Type', 'text/html').send(indexHtml)
        }
        next()
      })
    }
    else {
      ctx.log.error('static content path is not a directory', { path: ctx.config.static.path })
    }
  }
  catch (err) {
    if (/^ENOENT:/.test((err as Error).message)) {
      ctx.log.warn('static content path not found', { path: ctx.config.static.path })
    }
    else {
      ctx.log.error('failed to set up static content request handling', { err })
    }
  }

  app.use(finalError(ctx))
  app.use(finalNotFound)

  return app.listen(ctx.config.http.port)
}
