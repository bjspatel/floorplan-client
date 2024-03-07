/**
 * @file
 * @description Defines actions for my routes
 */
'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('app:routes:signup')
const helpers = require('./helpers')
const mailer = require('../../../lib/mailer')
const notifier = require('../../../lib/notifier')
const { NotFoundError } = require('../../../lib/errors')

const signupActions = {}

signupActions.create = async (req, res, next) => {
  try {
    const client = await helpers.createClient(req.body)
    const verificationToken = await helpers.createVerificationToken(client.id)

    await mailer.sendEmailVerificationMail(client, verificationToken)
    await notifier.sendClientSignupNotification(client.id)

    debug('Client signed up')
    req.log.info('Client signed up')

    res.data = { success: true }
    next()
  } catch (err) {
    next(err)
  }
}

signupActions.confirm = async (req, res, next) => {
  try {
    const VerificationTokenModel = mongoose.model('verificationtoken')
    const verificationToken = await VerificationTokenModel.findOne({
      token: req.params.token,
      expiry_date: {
        $gt: new Date()
      }
    })

    if (verificationToken === null) {
      throw new NotFoundError('token')
    }

    const ClientModel = mongoose.model('client')
    const client = await ClientModel.findById(verificationToken.client_id)

    await verificationToken.remove()

    debug('Verification token removed')
    req.log.info('Verification token removed')

    if (client === null) {
      throw new NotFoundError('client')
    }

    client.email_confirmed = true
    await client.save()

    debug('Client email confirmed')
    req.log.info('Client email confirmed')

    await mailer.sendSignupReceivedMail(client)
    await notifier.sendClientEmailConfirmedNotification(client.id)

    res.data = { success: true }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = signupActions
