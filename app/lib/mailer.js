'use strict'

const AWS = require('aws-sdk')
const assert = require('assert')
const debug = require('debug')('app:mailer')
const config = require('../../config')
const ClientModel = require('../init/models/client')
const UserModel = require('../init/models/user')
const VerificationTokenModel = require('../init/models/verificationtoken')
const { createComponentLogger } = require('./loggers')

const logger = createComponentLogger('app:mailer')

class Mailer {
  constructor () {
    assert.ok(config.AWS_SNS_TOPIC_COMMUNICATE_ARN, 'unexpected AWS_SNS_TOPIC_COMMUNICATE_ARN')
    this.sns = new AWS.SNS()
    debug('Initialized successfully')
    logger.info('Initialized successfully')
  }

  async sendLoginMail (user, link, expDate) {
    assert.equal(arguments.length, 3, 'Unexpected number of arguments')
    assert.equal(typeof user, 'object', 'User argument expected to be an object')
    assert.equal(typeof link, 'string', 'Link argument expected to be an string')
    assert.equal(typeof expDate, 'object', 'expDate argument expected to be an object')
    assert(user instanceof UserModel || user instanceof ClientModel, 'User argument argument expected to an instance of ClientModel or UserModel class')
    assert(expDate instanceof Date, 'expDate argument expected to an instance of Date class')

    debug('Sending login mail')
    logger.debug('Sending login mail')

    const payload = {
      event: 'CLIENT_LOGIN',
      link,
      email: user.email,
      name: user.name,
      date: expDate.toISOString()
    }
    await this.sendMail(payload)
  }

  async sendSignupReceivedMail (client) {
    assert.equal(arguments.length, 1, 'Unexpected number of arguments')
    assert.equal(typeof client, 'object', 'Client argument expected to be an object')
    assert(client instanceof ClientModel, 'Client argument expected to be an instance of ClientModel')

    debug(`Sending signup received mail (client ID: ${client.id})`)
    logger.debug(`Sending signup received mail (client ID: ${client.id})`)

    const payload = {
      event: 'SIGNUP_RECEIVED',
      account: client.deployment.domain,
      email: client.email,
      name: client.name
    }
    await this.sendMail(payload)
  }

  async sendEmailVerificationMail (client, token) {
    assert.equal(arguments.length, 2, 'Unexpected number of arguments')
    assert.equal(typeof client, 'object', 'Client argument expected to be an object')
    assert.equal(typeof token, 'object', 'Token argument expected to be an object')
    assert(client instanceof ClientModel, 'Client argument expected to be an instance of ClientModel')
    assert(token instanceof VerificationTokenModel, 'Token argument expected to be an instance of VerificationTokenModel')

    debug(`Sending mail verification mail (client ID: ${client.id})`)
    logger.debug(`Sending mail verification mail (client ID: ${client.id})`)

    const payload = {
      event: 'EMAIL_CONFIRM',
      link: config.EMAIL_VERIFICATION_URL_TEMPLATE.replace('%token%', token.token),
      email: client.email,
      name: client.name,
      date: token.expiry_date.toISOString()
    }
    await this.sendMail(payload)
  }

  async sendMail (data) {
    const params = {
      Message: JSON.stringify(data),
      TopicArn: config.AWS_SNS_TOPIC_COMMUNICATE_ARN
    }

    debug('Sending communicate SNS')
    logger.debug('Sending communicate SNS')

    try {
      const res = await this.sns.publish(params).promise()
      debug('Communicate SNS sent', res)
      logger.info('Communicate SNS sent', { res })
      return res
    } catch (err) {
      logger.error('Error sending communicate SNS', { err })
      throw err
    }
  }
}

module.exports = new Mailer()
