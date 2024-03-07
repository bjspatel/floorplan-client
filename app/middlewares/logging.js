/**
 * @file
 * @description Express logging
 */

'use strict'

const nanoid = require('nanoid')
const { createReqLogger } = require('../lib/loggers')

module.exports = function loggingMiddleware (req, res, next) {
  // add request ID
  const requestId = nanoid()
  req.id = requestId

  // log request immediately
  req.log = createReqLogger({ requestId: req.id })
  req.log.info('request', { req })

  // listen for response and log response
  res.on('finish', afterResponse)
  res.on('close', afterResponse)

  function afterResponse () {
    res.removeListener('finish', afterResponse)
    res.removeListener('close', afterResponse)
    req.log.info('response', { res })
  }

  next()
}
