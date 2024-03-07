'use strict'

const CustomError = require('./custom-error')

class InternalError extends CustomError {
  constructor (options = {}) {
    options.name = 'InternalError'
    options.status = 500
    super(options)

    this.setStack(Error.captureStackTrace(this))
  }
}

module.exports = InternalError
