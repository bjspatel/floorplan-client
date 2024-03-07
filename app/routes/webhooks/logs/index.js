/**
 * @file
 * @description Sets routes related to webhook logs routes
 */
'use strict'

const router = require('express').Router()

router.get('/',
  (req, res) => {
    res.json({
      success: true
    })
  }
)

module.exports = router
