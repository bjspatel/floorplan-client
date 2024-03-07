/**
 * @file
 * @description Defines response maps for my routes
 */
'use strict'

const myMap = {
  id: '_id',
  name: 'name',
  email: 'email',
  organization: 'organization',
  country: 'country',
  marketing_consent: 'marketing_consent',
  updated_at: 'updated_at',
  deployment: {
    field: 'deployment',
    map: {
      trial: 'trial',
      trial_end_date: 'trial_end_date',
      domain: 'domain'
    }
  },
  subscriptions: 'subscriptions'
}

module.exports = {
  edit: { status: 200, map: myMap },
  get: { status: 200, map: myMap }
}
