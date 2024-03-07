/**
 * @file
 * @description Middleware to handle error
 */
'use strict'

const debug = require('debug')('app:error')
const { CustomError, InternalError, NotFoundError } = require('../lib/errors')

module.exports = (err, req, res, next) => {
  if (!(err instanceof CustomError)) {
    err = err.status === 404 ? new NotFoundError('route') : new InternalError({ details: err })
  }

  debug(err.toStringVerbose())

  const error = {
    error: true,
    name: err.name
  }

  if (!(err instanceof InternalError)) {
    error.message = err.message
    error.details = err.details
  }

  const level = err instanceof InternalError ? 'error' : 'info'
  req.log[level]('error', { err })

  res.status(err.status || 500)
  res.json(error)

  next()
}
