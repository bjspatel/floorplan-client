/**
 * @file
 * @description Sets routes related to users
 */
'use strict'

const router = require('express').Router()
const { authenticate, authorize, validate, respond } = require('../../middlewares')
const { accessRules, responseMap, validationSchema } = require('./config')
const userActions = require('./actions')

router.post('/',
  authenticate,
  authorize(accessRules.create),
  validate(validationSchema.create),
  userActions.create,
  respond(responseMap.create)
)

router.get('/',
  authenticate,
  authorize(accessRules.get),
  userActions.list,
  respond(responseMap.get)
)

router.get('/:user_id',
  authenticate,
  authorize(accessRules.get),
  userActions.get,
  respond(responseMap.get)
)

router.put('/:user_id',
  authenticate,
  authorize(accessRules.edit),
  validate(validationSchema.edit),
  userActions.edit,
  respond(responseMap.edit)
)

router.delete('/:user_id',
  authenticate,
  authorize(accessRules.delete),
  userActions.delete,
  respond(responseMap.delete)
)

module.exports = router
