/**
 * @file
 * @description Tests /webhooks/paddle routes
 */
'use strict'

const optionsTest = require('./options.test')
const createTest = require('./create.test')

module.exports = () => {
  describe('Paddle Webhook', () => {
    optionsTest()
    createTest()
  })
}
