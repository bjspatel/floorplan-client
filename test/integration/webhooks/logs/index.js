/**
 * @file
 * @description Tests /webhook/logs routes
 */
'use strict'

const listTest = require('./list.test')

module.exports = () => {
  describe('Webhook Logs', () => {
    listTest()
  })
}
