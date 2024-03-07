/**
 * @file
 * @description Client model definition
 */

'use strict'

const mongoose = require('mongoose')
const { NotFoundError, ValidationError } = require('../../lib/errors')

const clientSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  email_confirmed: Boolean,
  organization: String,
  country: String,
  consent: Boolean,
  marketing_consent: Boolean,
  approved: {
    type: Boolean,
    default: false
  },
  deployment: {
    status: {
      type: String,
      enum: ['non_existent', 'active', 'suspended'],
      default: 'non_existent'
    },
    domain: {
      type: String,
      unique: true
    },
    app_version: String,
    trial: Boolean,
    trial_end_date: Date,
    node: String,
    ipaddress: String,
    ssh_port: Number,
    deployed_at: Date
  },
  subscriptions: [{
    _id: false,
    provider: {
      type: String,
      enum: [ 'paddle' ]
    },
    provider_subscription_id: String,
    provider_plan_id: String,
    status: {
      type: String,
      enum: [ 'deleted', 'active', 'past_due' ]
    },
    expiry_date: Date,
    cancel_url: String,
    update_url: String
  }]
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

clientSchema._middlewares = {}

clientSchema._middlewares.ensureUniquensess = async function (next) {
  const ClientModel = mongoose.model('client')
  const query = {
    _id: { $ne: this.id },
    $or: [
      { email: this.email },
      { 'deployment.domain': this.deployment.domain }
    ]
  }
  const existingClient = await ClientModel.findOne(query)

  if (existingClient === null) {
    return next()
  }

  if (existingClient.deployment.domain === this.deployment.domain) {
    const error = new ValidationError({ message: 'domain is already taken' })
    return next(error)
  }

  const error = new ValidationError({ message: 'email is already registered' })
  next(error)
}

clientSchema.pre('save', clientSchema._middlewares.ensureUniquensess)

clientSchema.methods.patchSubscriptionById = function patchSubscriptionById (subscriptionId, subscriptionData) {
  const subscriptionIndex = this.subscriptions.findIndex(sub => {
    return sub.provider === 'paddle' && sub.provider_subscription_id === subscriptionId
  })

  if (subscriptionIndex === -1) {
    throw new NotFoundError('subscription')
  }

  const updatedSubscription = Object.assign(this.subscriptions[subscriptionIndex], subscriptionData)
  this.subscriptions[subscriptionIndex] = updatedSubscription
  this.markModified('subscriptions')
}

module.exports = mongoose.model('client', clientSchema)
