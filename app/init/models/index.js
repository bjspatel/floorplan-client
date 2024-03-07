/**
 * @file
 * @description Init all models, and bind them togeter
 */

'use strict'

const user = require('./user')
const client = require('./client')
const token = require('./token')
const webhook = require('./webhook')
const verificationtoken = require('./verificationtoken')

module.exports = {
  user,
  client,
  token,
  webhook,
  verificationtoken
}
