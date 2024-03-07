/**
 * @file
 * @description Tests job runner functions
 */
'use strict'

const updateClientsTest = require('./update-clients.test')

module.exports = () => {
  describe('Jobs tests', () => {
    updateClientsTest()
  })
}
