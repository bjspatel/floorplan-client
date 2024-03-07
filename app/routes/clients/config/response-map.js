/**
 * @file
 * @description Defines response maps for client routes
 */
'use strict'

const clientMap = {
  id: '_id',
  name: 'name',
  email: 'email',
  email_confirmed: 'email_confirmed',
  organization: 'organization',
  country: 'country',
  consent: 'consent',
  marketing_consent: 'marketing_consent',
  approved: 'approved',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deployment: 'deployment',
  subscriptions: 'subscriptions'
}

const successMap = {
  success: 'success'
}

module.exports = {
  create: { status: 201, map: clientMap },
  edit: { status: 200, map: clientMap },
  list: { status: 200, map: clientMap },
  get: { status: 200, map: clientMap },
  delete: { status: 204, map: {} },
  deploy: { status: 200, map: successMap }
}
