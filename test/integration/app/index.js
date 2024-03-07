/**
 * @file
 * @description Tests application general features
 */
'use strict'

const nonExistingRouteTest = require('./non-existing.test')

module.exports = () => {
  describe('Application', () => {
    nonExistingRouteTest()
  })
}
