/**
 * @file
 * @description Defines actions for users
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const debug = require('debug')('app:routes:users')
const { isObjectId } = require('../../lib/util')
const { NotFoundError } = require('../../lib/errors')
const userActions = {}

userActions.create = async (req, res, next) => {
  try {
    const UserModel = mongoose.model('user')
    const result = await UserModel.create(req.body)

    debug('User created', result)
    req.log.info('User created', { userId: result.id })

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

userActions.list = async (req, res, next) => {
  try {
    const UserModel = mongoose.model('user')
    res.data = await UserModel.find({})
    next()
  } catch (err) {
    next(err)
  }
}

userActions.get = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.user_id)) {
      const UserModel = mongoose.model('user')
      result = await UserModel.findById(req.params.user_id)
    }

    if (result === null) {
      throw new NotFoundError('user')
    }

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

userActions.edit = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.user_id)) {
      const UserModel = mongoose.model('user')
      result = await UserModel.findById(req.params.user_id)
    }

    if (result === null) {
      throw new NotFoundError('user')
    }

    _.merge(result, req.body)
    await result.save()

    debug('User updated', result)
    req.log.info('User updated', { userId: result.id })

    res.data = result
    next()
  } catch (err) {
    next(err)
  }
}

userActions.delete = async (req, res, next) => {
  try {
    let result = null

    if (isObjectId(req.params.user_id)) {
      const UserModel = mongoose.model('user')
      result = await UserModel.findByIdAndDelete(req.params.user_id)
    }

    if (result === null) {
      throw new NotFoundError('user')
    }

    debug('User deleted', result)
    req.log.info('User deleted', { userId: result.id })

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = userActions
