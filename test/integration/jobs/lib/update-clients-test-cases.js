/**
 * @file
 * @description Generates an array of test cases for testing clients update functions
 */
'use strict'

const _ = require('lodash')
const moment = require('moment')

const trialClientJSON = require('../../client/fixtures/client-trial.json')
const subscriptionClientJSON = require('../../client/fixtures/client-subscription.json')

function generateTestCases () {
  const testCases = []
  const future = moment().add(7, 'days')
  const past = moment().subtract(7, 'days')
  const expired = moment().subtract(31, 'days')

  // trial client

  addTestCase('should skip trial client, expires in future',
    testCases, false, trailClient(future))

  addTestCase('should skip trial client, expired less than 30 days ago',
    testCases, false, trailClient(past))

  addTestCase('should update trial client, expired more than 30 days ago, should place deployment order',
    testCases, true, trailClient(expired))

  // single subscription active

  addTestCase('should skip subscription client (single active subscription), expires in future',
    testCases, false, subscriptionSingleActive(future))

  addTestCase('should skip subscription client (single active subscription), expired less than 30 days ago',
    testCases, false, subscriptionSingleActive(past))

  addTestCase('should update subscription client (single active subscription), expired more than 30 days ago, should place deployment order',
    testCases, true, subscriptionSingleActive(expired))

  // single subscription deleted

  addTestCase('should skip subscription client (single deleted subscription), expires in future',
    testCases, false, subscriptionSingleDeleted(future))

  addTestCase('should skip subscription client (single deleted subscription), expired less than 30 days ago',
    testCases, false, subscriptionSingleDeleted(past))

  addTestCase('should update subscription client (single deleted subscription), expired more than 30 days ago, should place deployment order',
    testCases, true, subscriptionSingleDeleted(expired))

  // multiple subscriptions

  addTestCase('should skip subscription client (active + deleted subscription), expires in future',
    testCases, false, subscriptionMultiple(future))

  addTestCase('should skip subscription client (active + deleted subscription), expired less than 30 days ago',
    testCases, false, subscriptionMultiple(past))

  addTestCase('should update subscription client (active + deleted subscription), expired more than 30 days ago, should place deployment order',
    testCases, true, subscriptionMultiple(expired))

  // special cases

  addTestCase('should skip client with inactive deployment, no trial, no subscription (trial failed client)',
    testCases, false, _.merge({}, trialClientJSON, { deployment: { status: 'non_existent', trial: false } }))

  addTestCase('should skip client with inactive deployment, no trial, deleted subscription (subscription cancelled client)',
    testCases, false, _.merge({}, subscriptionClientJSON, { deployment: { status: 'non_existent' }, subscriptions: [ { status: 'deleted' } ] }))

  addTestCase('should skip client with active deployment, no trial, no subscriptions (free usage client)',
    testCases, false, _.merge({}, trialClientJSON, { deployment: { status: 'active', trial: false } }))

  return testCases
}

function addTestCase (title, testCases, shouldUpdate, data) {
  testCases.push({ title, shouldUpdate, data })
}

function trailClient (expiryDate) {
  return _.merge({}, trialClientJSON, {
    deployment: {
      status: 'active',
      trial: true,
      trial_end_date: expiryDate.toISOString()
    }
  })
}

function subscriptionSingleActive (expiryDate) {
  return _.merge({}, subscriptionClientJSON, {
    deployment: {
      status: 'active'
    },
    subscriptions: [
      {
        expiry_date: expiryDate.toISOString()
      }
    ]
  })
}

function subscriptionSingleDeleted (expiryDate) {
  return _.merge({}, subscriptionClientJSON, {
    deployment: {
      status: 'active'
    },
    subscriptions: [
      {
        status: 'deleted',
        expiry_date: expiryDate.toISOString()
      }
    ]
  })
}

function subscriptionMultiple (expiryDate) {
  const subscription = subscriptionClientJSON.subscriptions[0]
  const client = _.merge({}, subscriptionClientJSON, {
    deployment: { status: 'active' }
  })
  client.subscriptions = [
    {
      ...subscription,
      status: 'deleted',
      expiry_date: moment().subtract(2, 'months').toISOString()
    },
    {
      ...subscription,
      status: 'active',
      expiry_date: expiryDate.toISOString()
    }
  ]
  return client
}

module.exports = generateTestCases()
