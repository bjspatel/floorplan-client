/**
 * @file
 * @description Module for sending system notifications
 */
'use strict'

const AWS = require('aws-sdk')
const assert = require('assert')
const debug = require('debug')('app:notifier')
const config = require('../../config')
const { createComponentLogger } = require('./loggers')

const logger = createComponentLogger('app:notifier')

const SUBJECT_PREFIX = '[Deskradar Clients API]'

class Notifier {
  constructor () {
    assert.ok(config.AWS_SNS_TOPIC_UPDATES_ARN, 'unexpected AWS_SNS_TOPIC_UPDATES_ARN')
    this.sns = new AWS.SNS()
    debug('Initialized successfully')
    logger.info('Initialized successfully')
  }

  async sendLoginNotification (userType, userId) {
    debug('Send login notification')
    logger.debug('Send login notification')

    assert.strictEqual(typeof userType, 'string', `unexpected userType argument type: ${typeof userType}`)
    assert.strictEqual(typeof userId, 'string', `unexpected userId argument type: ${typeof userId}`)
    assert.ok(userType, `unexpected userType value: "${userType}"`)
    assert.ok(userId, `unexpected userId value: "${userId}"`)

    const subject = 'Login'
    const message = {
      env: process.env.NODE_ENV,
      event: 'login',
      user_type: userType,
      user_id: userId
    }

    return this.sendNotification(subject, message)
  }

  async sendClientSignupNotification (clientId) {
    debug('Send client signup notification')
    logger.debug('Send client signup notification')

    assert.strictEqual(typeof clientId, 'string', `unexpected clientId argument type: ${typeof clientId}`)
    assert.ok(clientId, `unexpected cleintId value: "${clientId}"`)

    const subject = 'Client signup'
    const message = {
      env: process.env.NODE_ENV,
      event: 'signup',
      client_id: clientId
    }

    return this.sendNotification(subject, message)
  }

  async sendClientEmailConfirmedNotification (clientId) {
    debug('Send client email confirmed notification')
    logger.debug('Send client email confirmed notification')

    assert.strictEqual(typeof clientId, 'string', `unexpected clientId argument type: ${typeof clientId}`)
    assert.ok(clientId, `unexpected cleintId value: "${clientId}"`)

    const subject = 'Client email confirmed'
    const message = {
      env: process.env.NODE_ENV,
      event: 'email_confirmed',
      client_id: clientId
    }

    return this.sendNotification(subject, message)
  }

  async sendWebhookNotification (payload) {
    debug('Send webhook notification')
    logger.debug('Send webhook notification')

    assert.strictEqual(typeof payload, 'object', `unexpected data argument type: ${typeof payload}`)

    const subject = 'Webhook Received'
    const message = {
      env: process.env.NODE_ENV,
      event: 'webhook',
      payload
    }

    return this.sendNotification(subject, message)
  }

  async sendNotification (subject, message) {
    assert.ok(subject, 'unexpected subject')
    assert.ok(message, 'unexpected message')

    const params = {
      Message: JSON.stringify(message),
      Subject: `${SUBJECT_PREFIX} ${subject}`,
      TopicArn: config.AWS_SNS_TOPIC_UPDATES_ARN
    }

    debug('Sending SNS notification', params)
    logger.debug('Sending SNS notification')

    try {
      const res = await this.sns.publish(params).promise()
      debug('Notfication sent', res)
      logger.info('Notification sent', { res })
      return res
    } catch (err) {
      logger.error('Error sending notification', { err })
      throw err
    }
  }
}

module.exports = new Notifier()
