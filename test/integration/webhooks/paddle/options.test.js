/**
 * @file
 * @description Tests [OPTIONS] /webhooks/paddle route
 */
'use strict'

const { commonAssertions } = require('../../../test-util')

module.exports = () => {
  const url = '/webhooks/paddle'
  commonAssertions.describeOptionsRequest(url)
}
