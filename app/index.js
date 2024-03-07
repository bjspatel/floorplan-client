/**
 * @file
 * @description Starts application
 */

'use strict'

require('../config')
const db = require('./init/db')
const server = require('./init/server')
const jobs = require('./init/jobs')
const { appLogger } = require('./lib/loggers')

const SIGNALS = {
  'SIGINT': 2,
  'SIGTERM': 15
}

class App {
  constructor () {
    this.start()
  }

  async start () {
    try {
      this.db = await db()
      this.app = await server()
      jobs()
      this.prepareSignals()
    } catch (err) {
      appLogger.error('Start failed', { err })
      process.exit(1)
    }
  }

  prepareSignals () {
    Object.keys(SIGNALS).forEach(signal => {
      process.on(signal, () => {
        appLogger.info(`Process received ${signal} signal: gracefully shutting down http server and database connection`)
        const server = this.app.get('server')
        server.close(async (err) => {
          if (err) {
            appLogger.error('Error shutting down the server', { err })
            process.exit(1)
          }

          try {
            await this.db.disconnect()
          } catch (err) {
            appLogger.error('Error closing connection to the database', { err })
            process.exit(1)
          }

          process.exit(0)
        })
      })
    })
  }
}

module.exports = new App()
