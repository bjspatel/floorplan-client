/**
 * @file
 * @description Loads config values from environment
 */
'use strict'

const AWS = require('aws-sdk')
const path = require('path')
const joi = require('joi')
const dotenv = require('dotenv')
const bluebird = require('bluebird')
const { appLogger } = require('../app/lib/loggers')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

// .env.local takes precedence
dotenv.config({
  path: path.resolve(__dirname, `./env/.env.local`)
})

// current environment
dotenv.config({
  path: path.resolve(__dirname, `./env/.env.${process.env.NODE_ENV}`)
})

const envVarsSchemaKeys = {
  DB_URL: joi.string().required(),
  PORT: joi.number().integer().required(),
  JWT_SECRET: joi.string().required(),
  DEBUG: joi.string().allow('').default(''),
  EMAIL_VERIFICATION_URL_TEMPLATE: joi.string().uri().required(),
  PADDLE_PUBLIC_KEY: joi.string().required(),
  JOBS_INTERVAL: joi.number().min(1000).required(),
  AWS_ACCESS_KEY_ID: joi.string().required(),
  AWS_SECRET_ACCESS_KEY: joi.string().required(),
  AWS_DEFAULT_REGION: joi.string().required(),
  AWS_SNS_TOPIC_UPDATES_ARN: joi.string().required(),
  AWS_SNS_TOPIC_DEPLOY_ARN: joi.string().required(),
  AWS_SNS_TOPIC_COMMUNICATE_ARN: joi.string().required()
}

const envVarsSchema = joi.object(envVarsSchemaKeys).unknown().required()

const { error, value: envVars } = joi.validate(process.env, envVarsSchema)

// replace values after eventual coercion by joi
process.env = { ...envVars }

global.Promise = bluebird

if (error) {
  appLogger.error('Start failed because of environment variable errors', { errors: error.details.map(e => e.message) })
  process.exit(1)
}

// AWS configuration
AWS.config.update({
  accessKeyId: envVars.AWS_ACCESS_KEY_ID,
  secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  region: envVars.AWS_DEFAULT_REGION,
  apiVersions: {
    sns: '2010-03-31'
  }
})

const config = Object
  .keys(envVarsSchemaKeys)
  .reduce((accumulator, key) => {
    accumulator[key] = envVars[key]
    return accumulator
  }, {})

module.exports = config
