'use strict'

const CustomError = require('./custom-error')

class ValidationError extends CustomError {
  constructor (options = {}) {
    options.name = 'ValidationError'
    options.status = 422
    super(options)

    this.setStack(Error.captureStackTrace(this))
    if (options.joiError) {
      this.joiError = options.joiError
      this.details = options.joiError.map(error => ({
        type: error.type,
        message: error.message,
        path: error.path
      }))
    }
  }
}

module.exports = ValidationError
