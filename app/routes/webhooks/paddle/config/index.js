/**
 * @file
 * @description Integrates route configs for paddle webhook routes
 */
'use strict'

const validationSchema = require('./validate-schema')
const responseMap = require('./response-map')

module.exports = {
  validationSchema,
  responseMap
}
