/**
 * @file
 * @description Sets routes related to paddle webhook routes
 */
'use strict'

const router = require('express').Router()
const { validate, respond } = require('../../../middlewares')
const { validationSchema, responseMap } = require('./config')
const paddleWebhookActions = require('./actions')

router.post('/',
  validate(validationSchema.create),
  paddleWebhookActions.create,
  respond(responseMap.create)
)

module.exports = router
