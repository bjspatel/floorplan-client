/**
 * @file
 * @description Middleware to authenticate the request
 */
'use strict'

const passport = require('passport')
const debug = require('debug')('app:middlewares:authenticate')
const { UnauthorizedError } = require('../lib/errors')

module.exports = (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      const error = new UnauthorizedError({ details: err })
      return next(error)
    }

    if (!user) {
      const error = new UnauthorizedError({ message: 'User not found' })
      return next(error)
    }

    debug('User authenticated with JWT', user)
    req.log.info('User authenticated with JWT', { userId: user.id, userType: user.type })

    req.user = user
    next()
  })(req, res, next)
}
