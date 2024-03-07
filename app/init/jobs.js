/**
 * @file
 * @description Initializes job runner
 */

'use strict'

const Jobs = require('../lib/jobs')

module.exports = () => {
  const jobRunner = new Jobs()
  jobRunner.start()
}
