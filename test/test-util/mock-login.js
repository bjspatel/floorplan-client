'use strict'

const { generateToken } = require('../../app/routes/auth/actions/helpers')

async function login (user, userType, lifeInHours = 1) {
  user = { ...user, type: userType }
  const { token, payload } = generateToken(user._id, user.type)
  return { token, payload, user }
}

module.exports = login
