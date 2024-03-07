/**
 * @file
 * @description Tests /signup routes
 */
'use strict'

const createAccountTest = require('./create-account.test')
const confirmEmailTest = require('./confirm-email.test')

module.exports = () => {
  describe('Signup', () => {
    createAccountTest()
    confirmEmailTest()
  })
}
