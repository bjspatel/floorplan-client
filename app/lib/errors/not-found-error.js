'use strict'

const CustomError = require('./custom-error')

class NotFoundError extends CustomError {
  constructor (resource, options = {}) {
    options.name = 'NotFoundError'
    options.status = 404
    options.message = !resource ? options.message : `${resource} not found`
    super(options)

    this.setStack(Error.captureStackTrace(this))
  }
}

module.exports = NotFoundError
