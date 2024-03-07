/**
 * @file
 * @description Seeds collections with necessary data before starting each integration tests
 */
'use strict'

const mongoose = require('mongoose')
const dropDb = require('./drop-db')
const shared = require('./shared')

module.exports = async () => {
  try {
    await dropDb()
    await createUser(shared.userData1)
    await createUser(shared.userData2)
    await createClient(shared.clientData1)
    await createClient(shared.clientData2)
  } catch (err) {
    shared.log('Error seeding database: ', err)
    throw err
  }
}

async function createUser (userData) {
  const UserModel = mongoose.model('user')
  const user = new UserModel(userData)
  await user.save()
}

async function createClient (clientData) {
  const ClientModel = mongoose.model('client')
  const client = new ClientModel(clientData)
  await client.save()
}
