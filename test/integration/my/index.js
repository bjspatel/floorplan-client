/**
 * @file
 * @description Tests /my routes
 */
'use strict'

const optionsTest = require('./options.test')
const updateProfileTest = require('./update-profile.test')
const getProfileTest = require('./get-profile.test')

module.exports = () => {
  describe('My (Client Profile)', () => {
    optionsTest()
    getProfileTest()
    updateProfileTest()
  })
}
