/**
 * @file
 * @description Defines actions for paddle webhook routes
 */
'use strict'

const debug = require('debug')('app:routes:webhooks:paddle')
const notifier = require('../../../../lib/notifier')
const helpers = require('./helpers')
const paddleWebhookActions = {}

paddleWebhookActions.create = async (req, res, next) => {
  const data = req.body

  debug('Paddle webhook received', data)
  req.log.info('Paddle webhook received', { alertName: data.alertName })

  try {
    switch (data.alert_name) {
      case 'subscription_created':
        await helpers.subscriptionCreated(data)
        debug('Paddle webhook: Subscription created')
        req.log.info('Paddle webhook: Subscription created')
        break
      case 'subscription_updated':
        await helpers.subscriptionUpdated(data)
        debug('Paddle webhook: Subscription updated')
        req.log.info('Paddle webhook: Subscription updated')
        break
      case 'subscription_cancelled':
        await helpers.subscriptionCancelled(data)
        debug('Paddle webhook: Subscription cancelled')
        req.log.info('Paddle webhook: Subscription cancelled')
        break
      case 'subscription_payment_succeeded':
        await helpers.subscriptionPaymentSucceeded(data)
        debug('Paddle webhook: Payment succeeded')
        req.log.info('Paddle webhook: Payment succeeded')
        break
    }
    await notifier.sendWebhookNotification(data)
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = paddleWebhookActions
