'use strict'

const CustomError = require('./custom-error')

class UnauthorizedError extends CustomError {
  constructor (options = {}) {
    options.name = 'UnauthorizedError'
    options.status = 401
    super(options)

    this.setStack(Error.captureStackTrace(this))
  }
}

module.exports = UnauthorizedError
