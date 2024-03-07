/**
 * @file
 * @description Verification token model definition
 */

'use strict'

const mongoose = require('mongoose')
const generate = require('nanoid/generate')

const DICTIONARY = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const TOKEN_LENGTH = 64
const TOKEN_TTL_DAYS = 7

function defaultExpiryDate () {
  const date = new Date()
  date.setDate(date.getDate() + TOKEN_TTL_DAYS)
  return date
}

function generateToken () {
  return generate(DICTIONARY, TOKEN_LENGTH)
}

const verificationTokenSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client'
  },
  token: {
    type: String,
    unique: true,
    default: generateToken
  },
  expiry_date: {
    type: Date,
    default: defaultExpiryDate
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('verificationtoken', verificationTokenSchema)
