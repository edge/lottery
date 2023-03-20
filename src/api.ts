// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as earningsPayments from './earnings/payments/api'
import { Context } from './main'
import Package from '../package.json'
import cors from 'cors'
import express, { ErrorRequestHandler, RequestHandler } from 'express'

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
export default (ctx: Context) => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/version', version)

  app.get('/api/earnings/payments', earningsPayments.list(ctx))

  app.use(finalError(ctx))
  app.use(finalNotFound)

  return app.listen(ctx.config.http.port)
}