/**
 * @file
 * @description Unit Tests
 */
'use strict'

const deployerTests = require('./deployer')
const notifierTests = require('./notifier')
const mailerTests = require('./mailer')

module.exports = () => {
  describe('Unit Tests', () => {
    deployerTests()
    notifierTests()
    mailerTests()
  })
}
