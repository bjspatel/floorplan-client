/**
 * @file
 * @description Tests /clients routes
 */
'use strict'

const optionsTest = require('./options.test')
const createUserTest = require('./create-user.test')
const listUsersTest = require('./list-users.test')
const getUserTest = require('./get-user.test')
const updateUserTest = require('./update-user.test')
const deleteUserTest = require('./delete-user.test')

module.exports = () => {
  describe('Users', () => {
    optionsTest()
    createUserTest()
    listUsersTest()
    getUserTest()
    updateUserTest()
    deleteUserTest()
  })
}
