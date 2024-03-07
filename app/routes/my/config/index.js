/**
 * @file
 * @description Integrates route configs for my routes
 */
'use strict'

const accessRules = require('./access-rules')
const validationSchema = require('./validate-schema')
const responseMap = require('./response-map')

module.exports = {
  accessRules,
  validationSchema,
  responseMap
}
