/**
 * @file
 * @description Tests /clients routes
 */
'use strict'

const loginTest = require('./login.test')
const loginConfirmTest = require('./login-confirm.test')

module.exports = () => {
  describe('Auth', () => {
    loginTest()
    loginConfirmTest()
  })
}
