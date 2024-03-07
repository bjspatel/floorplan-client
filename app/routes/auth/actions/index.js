/**
 * @file
 * @description Defines actions for auth routes
 */
'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('app:routes:auth')
const moment = require('moment')
const helpers = require('./helpers')
const mailer = require('../../../lib/mailer')
const notifier = require('../../../lib/notifier')
const { NotFoundError, TooManyRequestsError } = require('../../../lib/errors')

const MAX_TOKENS_PER_HOUR = 3

const loginActions = {}

loginActions.login = async (req, res, next) => {
  try {
    const user = await helpers.getUser(req.body.type, req.body.email)
    const positiveResponse = { success: true }

    if (!user) {
      debug('User or client was not found or has not been approved yet')
      req.log.info('User or client was not found or has not been approved yet')
      res.data = positiveResponse
      return next()
    }

    const TokenModel = mongoose.model('token')

    // check if recent valid token already exists
    const tokensInPastHour = await TokenModel
      .find({
        user_id: user.id,
        user_type: req.body.type,
        created_at: { $gte: moment().subtract(1, 'hour') }
      })
      .sort({ craeted_at: -1 })
      .limit(MAX_TOKENS_PER_HOUR)

    // maximum exceeded? after how many seconds can the request be repeated
    if (tokensInPastHour.length >= MAX_TOKENS_PER_HOUR) {
      const oldestTokenCreatedDate = moment(tokensInPastHour[0].created_at)
      const diffSeconds = Math.floor(moment().diff(oldestTokenCreatedDate) / 1000)
      throw new TooManyRequestsError(diffSeconds)
    }

    // create token
    const token = new TokenModel({
      user_type: req.body.type,
      user_id: user.id
    })
    await token.save()

    debug('Login token created')
    req.log.info('Login token created')

    const link = req.body.url_template.replace('%token%', token.token)
    const expiryDate = token.expiry_date
    await mailer.sendLoginMail(user, link, expiryDate)

    res.data = positiveResponse
    next()
  } catch (err) {
    next(err)
  }
}

loginActions.confirm = async (req, res, next) => {
  try {
    const TokenModel = mongoose.model('token')
    const token = await TokenModel.findOne({
      token: req.params.token,
      expiry_date: {
        $gt: new Date()
      }
    })

    if (token === null) {
      throw new NotFoundError('token')
    }

    const Model = mongoose.model(token.user_type)
    const user = await Model.findById(token.user_id)

    await token.remove()

    debug('Token removed')
    req.log.info('Token removed')

    if (user === null) {
      throw new NotFoundError(token.user_type)
    }

    if (token.user_type === 'client' && user.email_confirmed !== true) {
      user.email_confirmed = true
      await user.save()
      debug('Client email confirmed')
      req.log.info('Client email confirmed')
    }

    const { token: jwtToken, expiryDate } = helpers.generateToken(token.user_id.toString(), token.user_type)

    debug('JWT created', jwtToken)
    req.log.info('JWT created', { expiryDate: expiryDate.toISOString() })

    await notifier.sendLoginNotification(token.user_type, user.id)

    res.data = {
      token: jwtToken,
      valid_until: expiryDate.toISOString()
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = loginActions
