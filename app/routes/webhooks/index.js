/**
 * @file
 * @description Sets routes related to webhooks
 */
'use strict'

const paddleRoutes = require('./paddle')
const logsRoutes = require('./logs')

const router = require('express').Router()

router.use('/paddle', paddleRoutes)
router.use('/logs', logsRoutes)

module.exports = router
