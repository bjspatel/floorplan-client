/**
 * @file
 * @description Tests update client job
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const sinon = require('sinon')
const { expect } = require('chai')
const { dropDb } = require('../../test-util')
const updateClientsTestCases = require('./lib/update-clients-test-cases')
const updateClientsJob = require('../../../app/lib/jobs/update-clients')
const deployer = require('../../../app/lib/deployer')

module.exports = () => {
  describe('Update clients job', () => {
    beforeEach(async () => {
      await dropDb()
      sinon.stub(deployer, 'placeOrder')
    })

    afterEach(() => {
      deployer.placeOrder.restore()
    })

    for (const testCase of updateClientsTestCases) {
      it(testCase.title, async function () {
        const ClientModel = mongoose.model('client')
        const client = new ClientModel(testCase.data)
        await client.save()
        await updateClientsJob.run()

        if (testCase.shouldUpdate === true) {
          sinon.assert.called(deployer.placeOrder)
          const targetClient = _.merge({}, testCase.data,
            {
              _id: client.id,
              deployment: {
                status: 'non_existent'
              }
            }
          )
          const clientArgumentModel = deployer.placeOrder.getCall(0).args[0]
          const clientArgumentObject = JSON.parse(JSON.stringify(clientArgumentModel))
          const relevantFieldsArgumentObject = _.omit(clientArgumentObject, 'created_at', 'updated_at', '__v')
          expect(relevantFieldsArgumentObject).to.deep.equal(targetClient)
        } else {
          sinon.assert.notCalled(deployer.placeOrder)
        }
      })

      if (testCase.shouldUpdate === true) {
        it('should send an email to the client')
      }
    }
  })
}
