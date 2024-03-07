/**
 * @file
 * @description Configure passport object
 */

'use strict'

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const mongoose = require('mongoose')
const config = require('../../config')

module.exports = passport => {
  passport.use(
    new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const Model = mongoose.model(payload.typ)
        let user = await Model.findById(payload.sub)

        user = user && user.toObject()
        user.type = payload.typ

        done(null, user)
      } catch (err) {
        done(err)
      }
    })
  )
}
