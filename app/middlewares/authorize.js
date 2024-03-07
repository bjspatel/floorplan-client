/**
 * @file
 * @description Middleware to authorize requests on the basis of given rules and the type of user logged in
 */
'use strict'

const debug = require('debug')('app:middlewares:authorize')
const { ForbiddenError } = require('../lib/errors')

module.exports = (rules) => {
  return async (req, res, next) => {
    const user = req.user
    const rule = rules[user.type]

    let canAccess = false
    if (rule === 'always') {
      canAccess = true
    } else if (rule === 'never') {
      canAccess = false
    } else if (typeof rule === 'function') {
      canAccess = await rule(req)
    }

    if (canAccess) {
      debug('Authorized action')
      next()
    } else {
      const error = new ForbiddenError()
      next(error)
    }
  }
}
