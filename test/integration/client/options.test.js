/**
 * @file
 * @description Tests [OPTIONS] /clients route
 */
'use strict'

const { commonAssertions } = require('../../test-util')

module.exports = () => {
  const url = '/clients'
  commonAssertions.describeOptionsRequest(url)
}
