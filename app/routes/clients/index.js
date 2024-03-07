/**
 * @file
 * @description Sets routes related to clients
 */
'use strict'

const router = require('express').Router()
const { authenticate, authorize, validate, respond } = require('../../middlewares')
const { accessRules, responseMap, validationSchema } = require('./config')
const clientActions = require('./actions')

router.post('/',
  authenticate,
  authorize(accessRules.create),
  validate(validationSchema.create),
  clientActions.create,
  respond(responseMap.create)
)

router.get('/',
  authenticate,
  authorize(accessRules.list),
  clientActions.list,
  respond(responseMap.list)
)

router.get('/:client_id',
  authenticate,
  authorize(accessRules.get),
  clientActions.get,
  respond(responseMap.get)
)

router.put('/:client_id',
  authenticate,
  authorize(accessRules.edit),
  validate(validationSchema.edit),
  clientActions.edit,
  respond(responseMap.edit)
)

router.delete('/:client_id',
  authenticate,
  authorize(accessRules.delete),
  clientActions.delete,
  respond(responseMap.delete)
)

router.put('/:client_id/deploy',
  authenticate,
  authorize(accessRules.deploy),
  validate(validationSchema.deploy),
  clientActions.deploy,
  respond(responseMap.deploy)
)

module.exports = router
