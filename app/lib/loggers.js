/**
 * @file
 * @description Loggers utility
 */
'use strict'

const _ = require('lodash')
const http = require('http')
const assert = require('assert')
const winston = require('winston')
const debug = require('debug')('app:lib:loggers')

const appLogger = createComponentLogger('app')

const formatLogEntry = winston.format((info, requestMetadata) => {
  try {
    formatRequestInfo(info)
  } catch (err) {
    appLogger.error(`Error parsing request data for logging: ${err.message}`)
  }

  try {
    formatResponseInfo(info)
  } catch (err) {
    appLogger.error(`Error parsing response data for logging: ${err.message}`)
  }

  // Add request metadata
  _.merge(info, requestMetadata)
  return info
})

function formatRequestInfo (info) {
  debug('formatRequestInfo: Formatting request log entry')
  if (!info.req) return

  assert.ok(info.req instanceof http.IncomingMessage, 'Logger parameter "req" is expected to be instance of http.ServerRequest')

  // Filter relevant data
  const req = _.pick(info.req, 'body', 'remoteAddress', 'method', 'query')
  req.url = info.req.originalUrl || info.req.url
  req.headers = { ...info.req.headers }

  if (typeof req.headers.authorization === 'string') {
    debug('formatRequestInfo: Masking authorization header')
    req.headers.authorization = req.headers.authorization.substr(0, 7) + '...'
  }

  info.req = req
}

function formatResponseInfo (info) {
  debug('formatResponseInfo: Formatting request log entry')
  if (!info.res) return

  assert(info.res instanceof http.ServerResponse, 'Logger parameter "res" is expected to be instance of http.IncomingMessage')

  // Filter relevant data
  const res = {
    statusCode: info.res.statusCode,
    header: info.res._header
  }

  info.res = res
}

function createReqLogger (requestMetadata) {
  debug('Creating request logger', requestMetadata)
  const reqLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.label({ label: 'req' }),
      formatLogEntry(requestMetadata),
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test'
      })
    ]
  })
  return reqLogger
}

function createComponentLogger (label) {
  debug('Creating component logger %s', label)
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test'
      })
    ]
  })
}

module.exports = {
  createComponentLogger,
  createReqLogger,
  appLogger
}
