/**
 * @file
 * @description Defines validation schemas for users routes
 */
'use strict'

const joi = require('joi')
const validationSchemas = {}

validationSchemas.create = joi.object().keys({
  name: joi.string().max(140).required()
    .options({ language: { string: { max: 'is too long' } } }),
  email: joi.string().email().required(),
  role: joi.string().valid('admin').required()
})

validationSchemas.edit = validationSchemas.create

module.exports = validationSchemas
