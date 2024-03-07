/**
 * @file
 * @description Defines validation schemas for paddle webhook routes
 */
'use strict'

// https://paddle.com/docs/subscriptions-event-reference/

const BaseJoi = require('joi')
const joiSignature = require('../../../../lib/joi-signature')
const validationSchemas = {}

const joi = BaseJoi.extend(joiSignature)

const fieldValidations = {
  alert_id: joi.string(),
  alert_name: joi.string(),
  cancel_url: joi.string().uri(),
  checkout_id: joi.string(),
  currency: joi.string(),
  email: joi.string(),
  event_time: joi.string(),
  next_bill_date: joi.string(),
  marketing_consent: joi.string().allow(''),
  p_signature: joi.string().required().signature(),
  passthrough: joi.object().required()
    .keys({
      client_id: joi.string().required()
    }),
  quantity: joi.string(),
  status: joi.string(),
  subscription_id: joi.string(),
  subscription_plan_id: joi.string(),
  unit_price: joi.string(),
  update_url: joi.string().uri(),
  user_id: joi.string()
}

const alertValidations = {
  subscription_created: joi
    .object({
      alert_id: fieldValidations.alert_id,
      alert_name: fieldValidations.alert_name,
      cancel_url: fieldValidations.cancel_url,
      checkout_id: fieldValidations.checkout_id,
      currency: fieldValidations.currency,
      email: fieldValidations.email,
      event_time: fieldValidations.event_time,
      marketing_consent: fieldValidations.marketing_consent,
      next_bill_date: fieldValidations.next_bill_date,
      p_signature: fieldValidations.p_signature,
      passthrough: fieldValidations.passthrough,
      quantity: fieldValidations.quantity,
      status: fieldValidations.status,
      subscription_id: fieldValidations.subscription_id,
      subscription_plan_id: fieldValidations.subscription_plan_id,
      unit_price: fieldValidations.unit_price,
      update_url: fieldValidations.update_url
    }),

  subscription_updated: joi.object()
    .keys({
      alert_id: fieldValidations.alert_id,
      alert_name: fieldValidations.alert_name,
      cancel_url: fieldValidations.cancel_url,
      checkout_id: fieldValidations.checkout_id,
      email: fieldValidations.email,
      event_time: fieldValidations.event_time,
      marketing_consent: fieldValidations.marketing_consent,
      new_price: joi.string(),
      new_quantity: joi.string(),
      new_unit_price: joi.string(),
      next_bill_date: fieldValidations.next_bill_date,
      old_price: joi.string(),
      old_quantity: joi.string(),
      old_unit_price: joi.string(),
      old_next_bill_date: joi.string(),
      old_status: joi.string(),
      old_subscription_plan_id: joi.string(),
      p_signature: fieldValidations.p_signature,
      passthrough: fieldValidations.passthrough,
      status: fieldValidations.status,
      subscription_id: fieldValidations.subscription_id,
      subscription_plan_id: fieldValidations.subscription_plan_id,
      update_url: fieldValidations.update_url
    }),

  subscription_cancelled: joi.object()
    .keys({
      alert_id: fieldValidations.alert_id,
      alert_name: fieldValidations.alert_name,
      cancellation_effective_date: joi.string(),
      checkout_id: fieldValidations.checkout_id,
      email: fieldValidations.email,
      event_time: fieldValidations.event_time,
      marketing_consent: fieldValidations.marketing_consent,
      p_signature: fieldValidations.p_signature,
      passthrough: fieldValidations.passthrough,
      quantity: fieldValidations.quantity,
      status: fieldValidations.status,
      subscription_id: fieldValidations.subscription_id,
      subscription_plan_id: fieldValidations.subscription_plan_id,
      unit_price: fieldValidations.unit_price,
      user_id: fieldValidations.user_id
    }),

  subscription_payment_succeeded: joi.object()
    .keys({
      alert_id: fieldValidations.alert_id,
      alert_name: fieldValidations.alert_name,
      balance_currency: joi.string(),
      balance_earnings: joi.string(),
      balance_fee: joi.string(),
      balance_gross: joi.string(),
      balance_tax: joi.string(),
      checkout_id: fieldValidations.checkout_id,
      country: joi.string(),
      coupon: joi.string().allow(''),
      currency: fieldValidations.currency,
      customer_name: joi.string().allow(''),
      earnings: joi.string(),
      email: fieldValidations.email,
      event_time: fieldValidations.event_time,
      fee: joi.string(),
      initial_payment: joi.string().allow(''),
      instalments: joi.string().allow(''),
      marketing_consent: fieldValidations.marketing_consent,
      next_bill_date: fieldValidations.next_bill_date,
      order_id: joi.string(),
      p_signature: fieldValidations.p_signature,
      passthrough: fieldValidations.passthrough,
      payment_method: joi.string(),
      payment_tax: joi.string(),
      plan_name: joi.string(),
      quantity: fieldValidations.quantity,
      receipt_url: joi.string().uri(),
      sale_gross: joi.string(),
      status: fieldValidations.status,
      subscription_id: fieldValidations.subscription_id,
      subscription_plan_id: fieldValidations.subscription_plan_id,
      unit_price: fieldValidations.unit_price,
      user_id: fieldValidations.user_id
    })
}

validationSchemas.create = Object.keys(alertValidations)
  .reduce((scheme, alertKey) => {
    const alertNameValidation = joi.object()
      .keys({ alert_name: joi.string().valid(alertKey).required() })
      .unknown()
    return scheme.when(alertNameValidation, {
      then: alertValidations[alertKey]
    })
  }, joi.alternatives())

// Fallback if none of the schemes were applied
validationSchemas.create = validationSchemas.create
  .when(joi.any(), {
    then: joi.object()
      .keys({
        alert_name: joi.valid(Object.keys(alertValidations)).required()
      })
      .unknown()
      .options({ language: { any: { allowOnly: 'is invalid' } } })
  })

module.exports = validationSchemas
