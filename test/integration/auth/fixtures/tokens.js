/**
 * @file
 * @description Fixtures for authentication tests
 */
'use strict'

const moment = require('moment')
const { shared } = require('../../../test-util')

const validUserToken = {
  _id: '5b56445974c888d85ec418c1',
  user_type: 'user',
  user_id: shared.userData1._id,
  expiry_date: moment().add(50, 'minutes'),
  created_at: moment().subtract(10, 'minutes'),
  token: 'nZflSZjTDxHZ60u17glMgHibQFWlF5aZO3RbKUyEwk7Xl5FHXcAFNYRVtDFp4pLb'
}

const validClientToken = {
  _id: '5b56445974c888d85ec418c2',
  user_type: 'client',
  user_id: shared.clientData1._id,
  expiry_date: moment().add(50, 'minutes'),
  created_at: moment().subtract(10, 'minutes'),
  token: 'l75XcahnQOd1bge3jWw6JsKhyyeFXrqCePmPkNEK5025VTxIAiSQnhjKs0pQ52vy'
}

const expiredUserToken = {
  _id: '5b56445974c888d85ec418c3',
  user_type: 'user',
  user_id: shared.userData1._id,
  expiry_date: moment().subtract(1, 'minute'),
  created_at: moment().subtract(59, 'minutes'),
  token: 'GVOFxc5XcVRPVvlkDNyxFL32yTM2x5L16TcpxAkklsTYWvjyenk7vQwYUtvHQelx'
}

const expiredClientToken = {
  _id: '5b56445974c888d85ec418c4',
  user_type: 'user',
  user_id: shared.userData1._id,
  expiry_date: moment().subtract(1, 'minute'),
  created_at: moment().subtract(59, 'minutes'),
  token: 'h4v2SXxzRRmmNiNXeU8g4yOvJQfbPNn67uRYVealU7YAJbxtq8YnoUqfQEZE97PL'
}

const nonExistingUserToken = {
  _id: '5b56445974c888d85ec418c5',
  user_type: 'user',
  user_id: '5b5644e4dedd55f15358ffff',
  expiry_date: moment().add(1, 'hour'),
  token: '3udS2k1y8AHT3pmIY8Ms9gbAilFIH8QvAxr573SPyhAZE6cXjB3Oo8RoKfNnV7Oq'
}

const nonExistingClientToken = {
  _id: '5b56445974c888d85ec418c6',
  user_type: 'client',
  user_id: '5b5644e4dedd55f15358ffff',
  expiry_date: moment().add(1, 'hour'),
  token: '5OFNlfBTwsge9qgO0yE5eMrR0Uq3DfH8eLZg58phfpKwFddqAND8w6114ijgIWP1'
}

module.exports = {
  validUserToken,
  validClientToken,
  expiredUserToken,
  expiredClientToken,
  nonExistingUserToken,
  nonExistingClientToken
}
