/**
 * @file
 * @description Defines validation schemas for my routes
 */
'use strict'

const BaseJoi = require('joi')
const JoiCountry = require('../../../lib/joi-country.js')
const validationSchemas = {}

const joi = BaseJoi.extend(JoiCountry)

validationSchemas.edit = joi.object()
  .keys({
    name: joi.string().max(140)
      .options({ language: { string: { max: 'is too long' } } }),
    organization: joi.string().max(140)
      .options({ language: { string: { max: 'is too long' } } }),
    country: joi.string().country(),
    marketing_consent: joi.boolean()
      .options({ convert: false })
  })

module.exports = validationSchemas
