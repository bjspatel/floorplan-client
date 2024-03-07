/**
 * @file
 * @description Module providing deployment order interface
 */
'use strict'

const _ = require('lodash')
const AWS = require('aws-sdk')
const assert = require('assert')
const debug = require('debug')('app:deployer')
const config = require('../../config')
const { createComponentLogger } = require('./loggers')

const logger = createComponentLogger('app:deployer')

class Deployer {
  constructor () {
    assert.ok(config.AWS_SNS_TOPIC_DEPLOY_ARN, 'unexpected AWS_SNS_TOPIC_DEPLOY_ARN')
    this.sns = new AWS.SNS()
    debug('Initialized successfully')
    logger.info('Initialized successfully')
  }

  async placeOrder (client) {
    debug('Placing order (client ID: %s)', client.id)
    logger.debug(`Placing order (client ID: ${client.id})`)

    const clientObject = client.toObject()
    clientObject.id = clientObject._id
    const deploymentPayload = _.pick(clientObject, [
      'id',
      'name',
      'email',
      'consent',
      'approved',
      'deployment.status',
      'deployment.domain',
      'deployment.app_version',
      'deployment.trial',
      'deployment.trial_end_date',
      'deployment.node',
      'deployment.ipaddress',
      'deployment.ssh_port'
    ])

    const params = {
      Message: JSON.stringify(deploymentPayload),
      TopicArn: config.AWS_SNS_TOPIC_DEPLOY_ARN
    }

    try {
      const res = await this.sns.publish(params).promise()
      debug('Deploy SNS sent', res)
      logger.info('Deploy SNS sent', { res })
      return res
    } catch (err) {
      logger.error('Error sending deploy SNS', { err })
      throw err
    }
  }
}

module.exports = new Deployer()
