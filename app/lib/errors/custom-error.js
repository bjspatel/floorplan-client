'use strict'

class CustomError extends Error {
  constructor (options) {
    super()
    this.name = options.name || 'CustomError'
    this.message = options.message || ''
    this.status = options.status || 500
    this.details = options.details || {}

    if (this.details instanceof Error) {
      Object.defineProperty(this.details, 'toJSON', {
        enumerable: false,
        configurable: true,
        writable: true,
        value () {
          return Object.getOwnPropertyNames(this)
            .reduce((a, key) => {
              a[key] = this[key]
              return a
            }, {})
        }
      })
    }
  }

  setStack (stack) {
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this)
    }
  }

  toString () {
    return `${this.name}: ${this.message}`
  }

  toStringVerbose () {
    return `[Error]: ${JSON.stringify(this, null, 4)}\n[Stacktrace]: ${this.stack}`
  }
}

module.exports = CustomError
