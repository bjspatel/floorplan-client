/**
 * @file
 * @description Joi extension for validating object signature
 */
'use strict'

const Serialize = require('php-serialize')
const crypto = require('crypto')
const config = require('../../config')

module.exports = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    unverifiedSignature: 'must be a valid signature'
  },
  rules: [
    {
      name: 'signature',
      validate (params, value, state, options) {
        // Signature
        const signature = value

        // Clone complete payload
        const input = Object.assign({}, state.parent)

        // Remove current field (signature) from the clone
        delete input[state.key]

        // PHP serialize the object
        const target = Object.keys(input).sort()
          .reduce((accumulator, key) => {
            accumulator[key] = input[key]
            return accumulator
          }, {})
        const serializedParams = Serialize.serialize(target)

        // Verify signature
        const verifier = crypto.createVerify('RSA-SHA1')
        verifier.write(serializedParams)
        verifier.end()

        const verified = verifier.verify(config.PADDLE_PUBLIC_KEY, signature, 'base64')

        if (verified) {
          return value
        }

        return this.createError('string.unverifiedSignature', { value }, state, options)
      }
    }
  ]
})
