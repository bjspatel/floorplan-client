/**
 * @file
 * @description Tests /clients routes
 */
'use strict'

const optionsTest = require('./options.test')
const createClientTest = require('./create-client.test')
const listClientsTest = require('./list-clients.test')
const getClientTest = require('./get-client.test')
const updateClientTest = require('./update-client.test')
const deleteClientTest = require('./delete-client.test')
const deployClientTest = require('./deploy-client.test')

module.exports = () => {
  describe('Clients', () => {
    optionsTest()
    createClientTest()
    listClientsTest()
    getClientTest()
    updateClientTest()
    deleteClientTest()
    deployClientTest()
  })
}
