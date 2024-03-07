'use strict'

const CustomError = require('./custom-error')

class TooManyRequestsError extends CustomError {
  constructor (retryAfter, options = {}) {
    options.name = 'TooManyRequestsError'
    options.status = 429
    options.message = 'too many requests'

    if (retryAfter) {
      options.details = { retryAfter }
    }

    super(options)

    this.setStack(Error.captureStackTrace(this))
  }
}

module.exports = TooManyRequestsError
