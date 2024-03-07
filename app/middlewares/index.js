/**
 * @file
 * @description Bundle all middlewares
 */
'use strict'

const logging = require('./logging')
const authenticate = require('./authenticate')
const authorize = require('./authorize')
const errorHandler = require('./error-handler')
const respond = require('./respond')
const validate = require('./validate')

module.exports = {
  logging,
  errorHandler,
  authenticate,
  authorize,
  validate,
  respond
}
