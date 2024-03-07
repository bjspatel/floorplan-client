/**
 * @file
 * @description Defines access rules for clients routes
 */
'use strict'

module.exports = {
  create: {
    user: 'always',
    client: 'never'
  },
  list: {
    user: 'always',
    client: 'never'
  },
  edit: {
    user: 'always',
    client: 'never'
  },
  get: {
    user: 'always',
    client: 'never'
  },
  delete: {
    user: 'always',
    client: 'never'
  },
  deploy: {
    user: 'always',
    client: 'never'
  }
}
