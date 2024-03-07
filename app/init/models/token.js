/**
 * @file
 * @description Token model definition
 */

'use strict'

const mongoose = require('mongoose')
const generate = require('nanoid/generate')

const DICTIONARY = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const TOKEN_LENGTH = 64
const TOKEN_TTL_HOURS = 1

function defaultExpiryDate () {
  const date = new Date()
  date.setHours(date.getHours() + TOKEN_TTL_HOURS)
  return date
}

function generateToken () {
  return generate(DICTIONARY, TOKEN_LENGTH)
}

const tokenSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ['user', 'client']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'user_type'
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

module.exports = mongoose.model('token', tokenSchema)
