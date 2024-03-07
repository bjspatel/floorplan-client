'use strict'

const { InternalError } = require('../lib/errors')

function mandatory () {
  throw new InternalError({ message: 'Function argument not specified' })
}

function isObjectId (id) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

module.exports = {
  mandatory,
  isObjectId
}
