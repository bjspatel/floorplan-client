/**
 * @file
 * @description Defines validation schemas for auth routes
 */
'use strict'

const joi = require('joi')
const validationSchemas = {}

validationSchemas.login = joi.object()
  .keys({
    type: joi.string().valid('client', 'user').required(),
    email: joi.string().email().required(),
    url_template: joi.string().uri().regex(/^https:\/\/[a-z0-9-]+\.deskradar\.com\/.*%token%.*$/).required()
      .options({ language: { string: { regex: { base: 'must be a valid url template' } } } })
  })

module.exports = validationSchemas
