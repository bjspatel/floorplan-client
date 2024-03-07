/**
 * @file
 * @description Defines response maps for users routes
 */
'use strict'

const userResponse = {
  id: '_id',
  name: 'name',
  email: 'email',
  role: 'role',
  created_at: 'created_at',
  updated_at: 'updated_at'
}

module.exports = {
  create: {
    status: 201,
    map: userResponse
  },
  edit: {
    status: 200,
    map: userResponse
  },
  get: {
    status: 200,
    map: userResponse
  },
  delete: {
    status: 204,
    map: {}
  }
}
