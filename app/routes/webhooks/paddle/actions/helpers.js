/**
 * @file
 * @description Helper functions for paddle webhook actions
 */
'use strict'

const mongoose = require('mongoose')
const deployer = require('../../../../lib/deployer')
const { isObjectId } = require('../../../../lib/util')
const { ForbiddenError, NotFoundError } = require('../../../../lib/errors')

async function subscriptionCreated (data) {
  try {
    const client = await getClient(data)

    client.deployment.trial = false

    const subscription = {
      status: data.status,
      expiry_date: new Date(data.next_bill_date).toISOString(),
      provider: 'paddle',
      provider_plan_id: data.subscription_plan_id,
      provider_subscription_id: data.subscription_id,
      cancel_url: data.cancel_url,
      update_url: data.update_url
    }

    client.subscriptions.push(subscription)

    await client.save()
    await deployer.placeOrder(client)
  } catch (err) {
    throw err
  }
}

async function subscriptionUpdated (data) {
  try {
    const client = await getClient(data)

    client.patchSubscriptionById(data.subscription_id, {
      status: data.status,
      expiry_date: new Date(`${data.next_bill_date} UTC`).toISOString(),
      provider_plan_id: data.subscription_plan_id,
      provider_subscription_id: data.subscription_id,
      cancel_url: data.cancel_url,
      update_url: data.update_url
    })

    await client.save()
  } catch (err) {
    throw err
  }
}

async function subscriptionCancelled (data) {
  try {
    const client = await getClient(data)

    client.patchSubscriptionById(data.subscription_id, {
      status: data.status,
      expiry_date: new Date(`${data.cancellation_effective_date} UTC`).toISOString(),
      provider_plan_id: data.subscription_plan_id
    })

    await client.save()
    await deployer.placeOrder(client)
  } catch (err) {
    throw err
  }
}

async function subscriptionPaymentSucceeded (data) {
  try {
    const client = await getClient(data)

    client.patchSubscriptionById(data.subscription_id, {
      status: data.status,
      expiry_date: new Date(`${data.next_bill_date} UTC`).toISOString(),
      provider_plan_id: data.subscription_plan_id,
      provider_subscription_id: data.subscription_id
    })

    await client.save()
  } catch (err) {
    throw err
  }
}

async function getClient (data) {
  const passthrough = JSON.parse(data.passthrough)
  const clientId = passthrough.client_id

  let result = null

  if (isObjectId(clientId)) {
    const ClientModel = mongoose.model('client')
    result = await ClientModel.findById(clientId)
  }

  if (result === null) {
    throw new NotFoundError('client')
  }

  if (result.approved !== true) {
    throw new ForbiddenError({ message: 'client is unapproved' })
  }

  if (!Array.isArray(result.subscriptions)) {
    result.subscriptions = []
  }

  return result
}

module.exports = {
  subscriptionCreated,
  subscriptionUpdated,
  subscriptionCancelled,
  subscriptionPaymentSucceeded
}
