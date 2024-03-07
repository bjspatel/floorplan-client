/**
 * @file
 * @description Job runner module to periodically execute jobs
 */
'use strict'

const config = require('../../../config')
const updateClientsJob = require('./update-clients')
const debug = require('debug')('app:lib:jobs')
const { createComponentLogger } = require('../loggers')

const jobs = [
  updateClientsJob
]

const logger = createComponentLogger('app:jobs')

class Jobs {
  constructor () {
    this.busy = false
    this.timer = null
    this.interval = config.JOBS_INTERVAL
  }

  start () {
    debug('Initializing job runner with interval %s ms', this.interval)
    logger.debug(`Initializing job runner with interval ${this.interval} ms`)
    this.timer = setInterval(this.run, this.interval)
  }

  stop () {
    debug('Stopping job runner')
    logger.debug('Stopping job runner')
    clearInterval(this.timer)
  }

  async run () {
    if (this.busy) {
      debug('Skipping job run: Another job is running')
      logger.debug('Skipping job run: Another job is running')
      return
    }

    debug('Starting jobs run')
    logger.debug('Starting jobs run')
    this.busy = true

    for (const job of jobs) {
      debug('Running job: %s', job.name)
      logger.debug(`Running job: ${job.name}`)
      try {
        await job.run()
      } catch (err) {
        debug('Error running job', err)
        logger.error('Error running job', { err })
      }
      logger.debug(`Job done: ${job.name}`)
      debug('Job done: %s', job.name)
    }
    this.busy = false
    debug('Jobs run finished')
    logger.debug('Jobs run finished')
  }
}

module.exports = Jobs
