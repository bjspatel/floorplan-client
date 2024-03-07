/**
 * @file
 * @description Tests deploy order functions
 */
'use strict'

const sinon = require('sinon')
const ClientModel = require('../../../app/init/models/client')
const { shared } = require('../../test-util')
const deployer = require('../../../app/lib/deployer')
const config = require('../../../config')

const expectedDeploymentPayloadJSON = require('./fixtures/deployment-payload.json')

module.exports = () => {
  describe('Deployment Orders', () => {
    const client = new ClientModel(shared.clientData1)

    beforeEach(function () {
      sinon.stub(deployer.sns, 'publish').returns({
        promise () {
          return Promise.resolve({})
        }
      })
    })

    afterEach(function () {
      deployer.sns.publish.restore()
    })

    it('should send SNS message for placing deployment order', async function () {
      await deployer.placeOrder(client)
      const expectedParams = {
        Message: JSON.stringify(expectedDeploymentPayloadJSON),
        TopicArn: config.AWS_SNS_TOPIC_DEPLOY_ARN
      }
      sinon.assert.calledOnce(deployer.sns.publish)
      sinon.assert.calledWith(deployer.sns.publish, expectedParams)
    })
  })
}
