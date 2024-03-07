/**
 * @file
 * @description Defines validation schemas for my routes
 */
'use strict'

const BaseJoi = require('joi')
const JoiCountry = require('../../../lib/joi-country.js')
const validationSchemas = {}

const joi = BaseJoi.extend(JoiCountry)

validationSchemas.create = joi.object()
  .keys({
    name: joi.string().max(140).required()
      .options({ language: { string: { max: 'is too long' } } }),
    email: joi.string().email().required(),
    organization: joi.string().max(140).required()
      .options({ language: { string: { max: 'is too long' } } }),
    domain: joi.string().required().min(3).max(32)
      .regex(/^[a-z0-9]+$/)
      .options({
        language: {
          string: {
            regex: { base: 'is invalid' },
            min: 'is too short',
            max: 'is too long'
          }
        }
      }),
    country: joi.string().country().required(),
    consent: joi.boolean().required()
      .options({ convert: false }),
    marketing_consent: joi.boolean().required()
      .options({ convert: false })
  })

validationSchemas.confirm = joi.object()
  .keys({
    token: joi.string().required()
      .regex(/^[a-zA-Z0-9]{64}$/)
      .options({ language: { string: { regex: { base: 'is invalid' } } } })
  })

module.exports = validationSchemas
