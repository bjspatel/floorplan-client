/**
 * @file
 * @description Holds all data shared among the integration tests for easy access
 */
'use strict'

const _ = require('lodash')
const validClientTrialJSON = require('../integration/client/fixtures/client-trial.json')
const validClientSubscriptionJSON = require('../integration/client/fixtures/client-subscription.json')
const shared = {}

shared.userData1 = {
  _id: '507f1f77bcf86cd799439011',
  email: 'peter.parker@deskradar.com',
  name: 'Peter Parker',
  role: 'admin'
}

shared.userData2 = {
  _id: '507f1f77bcf86cd799439012',
  email: 'klark.kent@deskradar.com',
  name: 'Klark Kent',
  role: 'admin'
}

shared.clientData1 = _.merge(
  { _id: '507f1f77bcf86cd799439013' },
  validClientTrialJSON,
  {
    email: 'existing.trial.client@deskradar.com',
    deployment: {
      domain: 'existingtrialdomain'
    }
  }
)

shared.clientData2 = _.merge(
  { _id: '507f1f77bcf86cd799439014' },
  validClientSubscriptionJSON,
  {
    email: 'existing.subscription.client@deskradar.com',
    deployment: {
      domain: 'existingsubscriptiondomain'
    }
  }
)

module.exports = shared
