/**
 * @file
 * @description Defines access rules for my routes
 */
'use strict'

module.exports = {
  edit: {
    user: 'never',
    client: 'always'
  },
  get: {
    user: 'never',
    client: 'always'
  }
}
