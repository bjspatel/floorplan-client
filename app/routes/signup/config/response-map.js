/**
 * @file
 * @description Defines response maps for signup routes
 */
'use strict'

const successMap = {
  success: 'success'
}

module.exports = {
  create: { status: 200, map: successMap },
  confirm: { status: 200, map: successMap }
}
