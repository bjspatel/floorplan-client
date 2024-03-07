/**
 * @file
 * @description Initializes express app
 */

'use strict'

const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const helmet = require('helmet')
const passport = require('passport')
const bodyParser = require('body-parser')

const configPassport = require('./passport')
const routes = require('../routes')
const { logging, errorHandler } = require('../middlewares')

const corsOptions = {
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}

module.exports = () => {
  const app = express()

  if (process.env.NODE_ENV === 'development') {
    const swaggerDoc = yaml.load('./docs/api.yaml')
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
  }

  app.use(logging)

  app.use(helmet())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  // set passport
  app.use(passport.initialize())
  configPassport(passport)

  // enable cors
  app.use(cors(corsOptions))

  // set routes
  app.use('/', routes)

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Route not found')
    err.status = 404
    next(err)
  })

  app.use(errorHandler)

  return app
}
