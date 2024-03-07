/**
 * @file
 * @description Connects Mongodb database
 */

'use strict'

require('./models')
const mongoose = require('mongoose')
const debug = require('debug')('app:init:db')
const config = require('../../config')
const { appLogger } = require('../lib/loggers')

module.exports = async () => {
  debug('Initializing database connection')

  mongoose.Promise = global.Promise

  mongoose.set('debug', process.env.NODE_ENV === 'development')

  if (mongoose.connection && mongoose.connection.readyState === 0) {
    await mongoose.connection.close()
  }

  mongoose.connection.on('error', err => {
    debug('Connection error', err)
    appLogger.error('Database connection error', { err })
    process.exit(1)
  })

  mongoose.connection.on('reconnectFailed', () => {
    debug('Database reconnection failed')
    appLogger.error('Database reconnection failed')
    process.exit(1)
  })

  mongoose.connection.on('connected', () => {
    debug('Database connected')
    appLogger.info('Database connected')
  })

  mongoose.connection.on('disconnected', () => {
    debug('Database disconnected')
    appLogger.info('Database disconnected')
  })

  const connectionOptions = {
    useNewUrlParser: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    reconnectTries: 10,
    reconnectInterval: 1000
  }

  // mongoose connection does not reject promise if there is `error` event listener
  // wrap it try/catch to avoid potential exceptions on mongoose updates
  try {
    const mongooseInstance = await mongoose.connect(config.DB_URL, connectionOptions)
    return mongooseInstance
  } catch (err) {
    debug('Connection error', err)
    appLogger.error('Database connection error', { err })
    process.exit(1)
  }
}
