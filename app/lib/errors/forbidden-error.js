'use strict'

const CustomError = require('./custom-error')
const assert = require('assert')

class ForbiddenError extends CustomError {
  constructor (options = {}) {
    assert.equal(typeof options, 'object')
    options.name = 'ForbiddenError'
    options.status = 403
    super(options)

    this.setStack(Error.captureStackTrace(this))
  }
}

module.exports = ForbiddenError
