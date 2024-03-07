/**
 * @file
 * @description Sets routes related to signup
 */
'use strict'

const router = require('express').Router()
const { validate, respond } = require('../../middlewares')
const { responseMap, validationSchema } = require('./config')
const signupActions = require('./actions')

router.post('/',
  validate(validationSchema.create),
  signupActions.create,
  respond(responseMap.create)
)

router.get('/confirm/:token',
  validate(validationSchema.confirm, 'params'),
  signupActions.confirm,
  respond(responseMap.confirm)
)

module.exports = router
