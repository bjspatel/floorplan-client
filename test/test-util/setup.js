/**
 * @file
 * @description Sets up utility modules and express app before starting integration tests
 */
'use strict'

require('../../config')
const db = require('../../app/init/db')
const getApp = require('../../app/init/express')
const logTest = require('debug')('app:test')
const shared = require('./shared')
const mongoose = require('mongoose')

module.exports = async () => {
  shared.log = logTest

  await db()
  shared.app = getApp()

  mongoose.set('debug', false)
}
