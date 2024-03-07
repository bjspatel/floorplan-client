/**
 * @file
 * @description Helper functions for signup actions
 */
'use strict'

const mongoose = require('mongoose')

const DEFAULT_APP_VERSION = '0.0.0'
const DEFAULT_NODE = ''
const DEFAULT_IPADDRESS = ''
const DEFAULT_SSH_PORT = 22

async function createClient (data) {
  const newClientData = {
    name: data.name.trim(),
    email: data.email.toLowerCase(),
    email_confirmed: false,
    organization: data.organization.trim(),
    country: data.country,
    consent: data.consent,
    marketing_consent: data.marketing_consent,
    deployment: {
      status: 'non_existent',
      domain: data.domain,
      app_version: DEFAULT_APP_VERSION,
      trial: true,
      trial_end_date: Date.now(),
      node: DEFAULT_NODE,
      ipaddress: DEFAULT_IPADDRESS,
      ssh_port: DEFAULT_SSH_PORT
    },
    subscriptions: []
  }
  const ClientModel = mongoose.model('client')
  const client = new ClientModel(newClientData)
  return client.save()
}

async function createVerificationToken (clientId) {
  const VerificationTokenModel = mongoose.model('verificationtoken')
  const token = new VerificationTokenModel({ client_id: clientId })
  return token.save()
}

module.exports = {
  createClient,
  createVerificationToken
}
