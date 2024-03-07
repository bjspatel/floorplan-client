/**
 * @file
 * @description Joi extension for validating country code
 */
'use strict'

const ISOCountryCodes = require('iso-country-codes')

module.exports = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    countryCode: 'needs to be a valid ISO 3166-1 alpha-2 country code'
  },
  rules: [
    {
      name: 'country',
      setup (params) {
        this._flags.country = true
      },
      validate (params, value, state, options) {
        if (ISOCountryCodes.byAlpha2[value]) {
          return value.toUpperCase()
        }
        return this.createError('string.countryCode', { value }, state, options)
      }
    }
  ]
})
