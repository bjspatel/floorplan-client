/**
 * @file
 * @description Tests [GET] /confirm-email/{token} route
 */
'use strict'

const moment = require('moment')
const { shared } = require('../../../test-util')

const client1TokenExpired1 = {
  _id: '5b5496cdf9ba29bfbeb0938d',
  client_id: shared.clientData1._id,
  expiry_date: moment().subtract(10, 'days'),
  created_at: moment().subtract(17, 'days'),
  token: 'NPlQAeVwpkWxSmTKAWoIxRy4uope6GHnhJC8UPAvmekFUCpygvl16evu4P0IGQsf'
}

const client1TokenExpired2 = {
  _id: '5b5496cdf9ba29bfbeb0938e',
  client_id: shared.clientData1._id,
  expiry_date: moment().subtract(3, 'days'),
  created_at: moment().subtract(10, 'days'),
  token: 'cchmRlwgEV8TKrZPWIBYJPG7Zm0JeIywiMr1ELXapXjKiJNQfRRfdaaPQmdZOH4i'
}

const client1TokenValid = {
  _id: '5b5496cdf9ba29bfbeb0938f',
  client_id: shared.clientData1._id,
  expiry_date: moment().add(3, 'days'),
  created_at: moment().subtract(4, 'days'),
  token: 'lkKCdkPeA557FQgNDn9JGNdSIGrXzQAvtvlSMfARu48QhfODgecC8KR27sKhaM5Z'
}

const client2TokenExpired1 = {
  _id: '5b5497877423abe16e7df45c',
  client_id: shared.clientData2._id,
  expiry_date: moment().subtract(10, 'days'),
  created_at: moment().subtract(17, 'days'),
  token: 'fc9nbTwiSfKYZXYKZlWEB32rB9GmXkNSkbxoTONLxZhdL8aArTgvuwcPG6I1axJy'
}

const client2TokenExpired2 = {
  _id: '5b5497877423abe16e7df45d',
  client_id: shared.clientData2._id,
  expiry_date: moment().subtract(3, 'days'),
  created_at: moment().subtract(10, 'days'),
  token: 'USyUt3gdSJq8fFjMvNrFOfrNgmWgxHLKKVYGz11sAbhkGB1OvM01FUcKfcWSg0UY'
}

const client2TokenValid = {
  _id: '5b5497877423abe16e7df45e',
  client_id: shared.clientData2._id,
  expiry_date: moment().add(3, 'days'),
  created_at: moment().subtract(4, 'days'),
  token: 'vAonXiG3ZXPkSK51XaioUrmhimTYu0nLXxKZKv5XBX8spqI0xRuPDjC2FB08ZKmm'
}

const nonExistentClientTokenValid = {
  _id: '5b5497877423abe16e7df45f',
  client_id: '5b5497877423abe16effffff',
  expiry_date: moment().add(3, 'days'),
  created_at: moment().subtract(4, 'days'),
  token: 'GL0ynxD4KXLWJnivQYVyg1pnCQZr1BC3mSFzWcLdGe0YlTzSkW2Fl6dRkLQ3mgWA'
}

module.exports = {
  client1TokenExpired1,
  client1TokenExpired2,
  client1TokenValid,
  client2TokenExpired1,
  client2TokenExpired2,
  client2TokenValid,
  nonExistentClientTokenValid
}
