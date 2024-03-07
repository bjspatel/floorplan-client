/**
 * @file
 * @description Defines actions for clients
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const debug = require('debug')('app:routes:clients')
const { isObjectId } = require('../../lib/util')
const { NotFoundError } = require('../../lib/errors')
const deployer = require('../../lib/deployer')
const clientActions = {}

clientActions.create = async (req, res, next) => {
  try {
    const ClientModel = mongoose.model('client')
    const result = await ClientModel.create(req.body)

    debug('Client created', result)
    req.log.info('Client created', { clientId: result.id })

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

clientActions.list = async (req, res, next) => {
  try {
    const ClientModel = mongoose.model('client')
    res.data = await ClientModel.find({})
    next()
  } catch (err) {
    next(err)
  }
}

clientActions.get = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.client_id)) {
      const ClientModel = mongoose.model('client')
      result = await ClientModel.findById(req.params.client_id)
    }

    if (result === null) {
      throw new NotFoundError('client')
    }

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

clientActions.edit = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.client_id)) {
      const ClientModel = mongoose.model('client')
      result = await ClientModel.findById(req.params.client_id)
    }

    if (result === null) {
      throw new NotFoundError('client')
    }

    _.mergeWith(result, req.body, (objValue, srcValue) => {
      // overwrite arrays
      if (_.isArray(srcValue)) {
        return srcValue
      }
    })

    await result.save()

    debug('Client updated', result)
    req.log.info('Client updated', { clientId: result.id })

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

clientActions.delete = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.client_id)) {
      const ClientModel = mongoose.model('client')
      result = await ClientModel.findByIdAndDelete(req.params.client_id)
    }

    if (result === null) {
      throw new NotFoundError('client')
    }

    debug('Client deleted', result)
    req.log.info('Client deleted', { clientId: result.id })

    next()
  } catch (err) {
    next(err)
  }
}

clientActions.deploy = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.client_id)) {
      const ClientModel = mongoose.model('client')
      result = await ClientModel.findById(req.params.client_id)
    }

    if (result === null) {
      throw new NotFoundError('client')
    }

    await deployer.placeOrder(result)

    debug('Client deploy action complete', result)
    req.log.info('Client deploy action complete', { clientId: result.id })

    res.data = { success: true }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = clientActions
