/**
 * @file
 * @description Tests [OPTIONS] /my route
 */
'use strict'

const { commonAssertions } = require('../../test-util')

module.exports = () => {
  const url = '/my'
  commonAssertions.describeOptionsRequest(url)
}
