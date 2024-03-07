/**
 * @file
 * @description Middleware to validate the input data given to the request
 */
'use strict'

const joi = require('joi')
const { ValidationError } = require('../lib/errors')

module.exports = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = joi.validate(req[property], schema)
    if (result.error) {
      const validationError = new ValidationError({ joiError: result.error.details })
      return next(validationError)
    }
    next()
  }
}
