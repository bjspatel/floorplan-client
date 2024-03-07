/**
 * @file
 * @description Functions to help the login action middlewares
 */
'use strict'

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { InternalError } = require('../../../lib/errors')
const assert = require('assert')
const config = require('../../../../config')

const TOKEN_TTL_HOURS = 1

async function getUser (type, email) {
  assert.equal(typeof type, 'string')
  assert.equal(typeof email, 'string')
  assert.ok(['user', 'client'].includes(type))
  const Model = mongoose.model(type)
  try {
    switch (type) {
      case 'client':
        return Model.findOne({ email, approved: true })
      case 'user':
        return Model.findOne({ email })
    }
  } catch (err) {
    throw new InternalError({ details: err })
  }
}

function generateToken (userId, userType) {
  assert.equal(typeof userId, 'string')
  assert.equal(typeof userType, 'string')
  assert.ok(['user', 'client'].includes(userType))
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + TOKEN_TTL_HOURS)
  const payload = {
    sub: userId,
    typ: userType,
    exp: Math.floor(expiryDate.getTime() / 1000)
  }
  const token = jwt.sign(payload, config.JWT_SECRET)
  return { payload, token, expiryDate }
}

function verifyToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded)
        }
      }
    )
  })
}

module.exports = {
  getUser,
  generateToken,
  verifyToken
}
