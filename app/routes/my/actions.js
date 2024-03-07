/**
 * @file
 * @description Defines actions for my routes
 */
'use strict'

const mongoose = require('mongoose')
const debug = require('debug')('app:routes:my')
const myActions = {}

myActions.get = async (req, res, next) => {
  try {
    const clientId = req.user._id
    const ClientModel = mongoose.model('client')
    res.data = await ClientModel.findById(clientId)
    next()
  } catch (err) {
    next(err)
  }
}

myActions.edit = async (req, res, next) => {
  try {
    const clientId = req.user._id
    const ClientModel = mongoose.model('client')
    const result = await ClientModel.findByIdAndUpdate(clientId, req.body, { new: true })

    debug('Client updated via /my route', result)
    req.log.info('Client updated via /my route', { clientId: result.id })

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = myActions
