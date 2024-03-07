/**
 * @file
 * @description Sets routes related to client profile
 */
'use strict'

const router = require('express').Router()
const { authenticate, authorize, validate, respond } = require('../../middlewares')
const { accessRules, responseMap, validationSchema } = require('./config')
const profileActions = require('./actions')

router.get('/',
  authenticate,
  authorize(accessRules.get),
  profileActions.get,
  respond(responseMap.get)
)

router.patch('/',
  authenticate,
  authorize(accessRules.edit),
  validate(validationSchema.edit),
  profileActions.edit,
  respond(responseMap.edit)
)

module.exports = router
