/**
 * @file
 * @description Integration test begin file
 */
'use strict'

const { setup, shared } = require('../test-util')

const appTests = require('./app')
const authTests = require('./auth')
const signupTests = require('./signup')
const userTests = require('./user')
const clientTests = require('./client')
const myTests = require('./my')
const webhookTests = require('./webhooks')
const jobTests = require('./jobs')

module.exports = () => {
  describe('Integration Tests', () => {
    before(async () => {
      try {
        await setup()
      } catch (err) {
        shared.log('Error during test startup:', err)
        process.exit(1)
      }
    })

    appTests()
    authTests()
    signupTests()
    userTests()
    clientTests()
    myTests()
    webhookTests()
    jobTests()
  })
}
