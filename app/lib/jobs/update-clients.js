/**
 * @file
 * @description Function to update client data when subscription or trial expire
 */
'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const debug = require('debug')('app:jobs:updateClients')
const deployer = require('../deployer')
const { createComponentLogger } = require('../loggers')

const logger = createComponentLogger('app:jobs:updateClients')

function createCondition () {
  const conditionTrialExpired = {
    'deployment.status': 'active',
    'deployment.trial': true,
    'deployment.trial_end_date': {
      $lt: moment().subtract(30, 'days')
    }
  }

  const conditionSubscriptionExpired = {
    'deployment.status': 'active',
    'deployment.trial': false,
    subscriptions: {
      $exists: true,
      $ne: [],
      $not: {
        $elemMatch: {
          expiry_date: {
            $gt: moment().subtract(30, 'days')
          }
        }
      }
    }
  }

  const condition = {
    $or: [
      conditionTrialExpired,
      conditionSubscriptionExpired
    ]
  }

  return condition
}

async function updateClients () {
  debug('Started')
  logger.debug('Started')

  const condition = createCondition()
  const ClientModel = mongoose.model('client')

  let count = 0

  while (true) {
    const client = await ClientModel.findOne(condition)

    if (client === null) {
      break
    }

    count++

    debug(`Scheduling client deployment for removal (client ID: ${client.id})`)
    logger.info(`Scheduling client deployment for removal (client ID: ${client.id})`)

    client.deployment.status = 'non_existent'
    await client.save()
    await deployer.placeOrder(client)
  }

  debug(`Finished with ${count} client(s)`)
  logger.debug(`Finished with ${count} client(s)`)
}

module.exports = {
  name: 'updateClients',
  run: updateClients
}
