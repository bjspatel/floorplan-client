/**
 * @file
 * @description Defines response maps for auth routes
 */
'use strict'

module.exports = {
  login: {
    status: 202,
    map: { success: 'success' }
  },
  confirm: {
    status: 200,
    map: { token: 'token', valid_until: 'valid_until' }
  }
}
