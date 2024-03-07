/**
 * @file
 * @description Webhook model definition
 */

'use strict'

const mongoose = require('mongoose')

const webhookSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['netlify', 'paddle']
  },
  payload: Object,
  receivedAt: Date
})

module.exports = mongoose.model('webhook', webhookSchema)
