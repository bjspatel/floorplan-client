/**
 * @file
 * @description Middleware to verify if the valid configuration are present to make email service work
 */
'use strict'

const logError = require('debug')('app:error')

module.exports = (req, res, next) => {
  logError('TODO: Middleware to verify email service')
  next()
}
