/**
 * @file
 * @description Sets routes related to auth
 */
'use strict'

const router = require('express').Router()
const { validate, respond } = require('../../middlewares')
const { responseMap, validationSchema } = require('./config')
const loginActions = require('./actions')

router.post('/',
  validate(validationSchema.login),
  loginActions.login,
  respond(responseMap.login)
)

router.get('/confirm/:token',
  loginActions.confirm,
  respond(responseMap.confirm)
)

module.exports = router
