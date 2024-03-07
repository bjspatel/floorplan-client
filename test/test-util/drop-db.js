/**
 * @file
 * @description Empties all collections in database
 */
'use strict'

const debugTest = require('debug')('app:test')
const mongoose = require('mongoose')

module.exports = async () => {
  try {
    const User = mongoose.model('user')
    const Client = mongoose.model('client')
    const Token = mongoose.model('token')
    const Webhook = mongoose.model('webhook')
    const VerificationToken = mongoose.model('verificationtoken')
    await User.remove({})
    await Client.remove({})
    await Token.remove({})
    await Webhook.remove({})
    await VerificationToken.remove({})
  } catch (err) {
    debugTest('Error while dropping db', err)
  }
}
