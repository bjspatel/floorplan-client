/**
 * @file
 * @description Defines validation schemas for client routes
 */
'use strict'

const BaseJoi = require('joi')
const JoiCountry = require('../../../lib/joi-country.js')
const validationSchemas = {}
const deploymentValidationSchemas = {}

const joi = BaseJoi.extend(JoiCountry)

deploymentValidationSchemas.create = joi.object()
  .keys({
    status: joi.string().valid('non_existent', 'active', 'suspended').required()
      .options({ language: { any: { allowOnly: 'is invalid' } } }),
    domain: joi.string().required().min(3).max(32)
      .regex(/^[a-z0-9]+$/)
      .options({
        language: {
          string: {
            regex: {
              base: 'is invalid'
            },
            min: 'is too short',
            max: 'is too long'
          }
        }
      }),
    app_version: joi.string().required()
      .regex(/^(?:0|[1-9]\d?)\.(?:0|[1-9]\d?)\.(?:0|[1-9]\d?)(?:-dev)?$/)
      .options({ language: { string: { regex: { base: 'is invalid' } } } }),
    trial: joi.boolean().required()
      .options({ convert: false }),
    trial_end_date: joi.date().iso().required(),
    node: joi.string().required().allow('').hostname().max(32)
      .options({ language: { string: { max: 'is too long' } } }),
    ipaddress: joi.string().required().allow('').ip({
      version: [ 'ipv4' ],
      cidr: 'forbidden'
    })
      .options({ language: { string: { ipVersion: 'must be a valid IP address' } } }),
    ssh_port: joi.number().required().min(1).max(65535)
      .options({
        convert: false,
        language: {
          number: {
            min: 'must be a valid port number',
            max: 'must be a valid port number'
          }
        }
      }),
    deployed_at: joi.date().iso()
  })
  .required()
  .unknown(false)

validationSchemas.create = joi.object()
  .keys({
    name: joi.string().required().max(140)
      .options({ language: { string: { max: 'is too long' } } }),
    email: joi.string().email().required(),
    email_confirmed: joi.boolean().required()
      .options({ convert: false }),
    organization: joi.string().required().max(140)
      .options({ language: { string: { max: 'is too long' } } }),
    country: joi.string().required().country(),
    consent: joi.boolean().required()
      .options({ convert: false }),
    marketing_consent: joi.boolean().required()
      .options({ convert: false }),
    approved: joi.boolean().required()
      .options({ convert: false }),
    deployment: deploymentValidationSchemas.create,
    subscriptions: joi.array().required()
  })

validationSchemas.edit = validationSchemas.create

validationSchemas.deploy = joi.object().keys({})

module.exports = validationSchemas
