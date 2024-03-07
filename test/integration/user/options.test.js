/**
 * @file
 * @description Tests [OPTIONS] /users route
 */
'use strict'

const { commonAssertions } = require('../../test-util')

module.exports = () => {
  const url = '/users'
  commonAssertions.describeOptionsRequest(url)
}
