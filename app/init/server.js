/**
 * @file
 * @description Starts server by using express app
 */

'use strict'

const http = require('http')
const getApp = require('./express')
const config = require('../../config')
const { appLogger } = require('../lib/loggers')

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
  const port = parseInt(val, 10)
  return isNaN(port)
    ? val
    : (port >= 0)
      ? port
      : false
}

module.exports = () => new Promise((resolve, reject) => {
  const app = getApp()
  const port = normalizePort(config.PORT)
  app.set('port', port)

  // Create HTTP server
  const server = http.createServer(app)

  // Make server instance available on exported object
  app.set('server', server)

  // Detect the error and show appropriate message
  server.on('error', err => {
    if (err.syscall !== 'listen') {
      reject(err)
    }

    var bind = (typeof port === 'string')
      ? 'Pipe ' + port
      : 'Port ' + port

    // Handle specific errors with friendly messages
    switch (err.code) {
      case 'EACCES':
        appLogger.error(`${bind} requires elevated privileges`, { err })
        process.exit(1)
      case 'EADDRINUSE':
        appLogger.error(`${bind} is already in use`, { err })
        process.exit(1)
      default:
        reject(err)
    }
  })

  // Listen on provided port, on all network interfaces
  server.listen(port, () => {
    const addr = server.address()
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port

    appLogger.info(`Listening on ${bind}`)
    resolve(app)
  })
})
