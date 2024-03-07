/**
 * @file
 * @description Sets all routes to express app
 */
'use strict'

const router = require('express').Router()

const authRoutes = require('./auth')
const signupRoutes = require('./signup')
const usersRoutes = require('./users')
const clientsRoutes = require('./clients')
const webhooksRoutes = require('./webhooks')
const myRoutes = require('./my')

router.get('/', function (req, res) {
  res.status(200).send('Auth')
})

router.use('/signup', signupRoutes)
router.use('/login', authRoutes)
router.use('/users', usersRoutes)
router.use('/clients', clientsRoutes)
router.use('/my', myRoutes)
router.use('/webhooks', webhooksRoutes)

module.exports = router
