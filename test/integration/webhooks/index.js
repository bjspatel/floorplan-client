/**
 * @file
 * @description Tests /webhooks routes
 */
'use strict'

const paddleTests = require('./paddle')
const logsTests = require('./logs')

module.exports = () => {
  describe('Webhooks', () => {
    paddleTests()
    logsTests()
  })
}
