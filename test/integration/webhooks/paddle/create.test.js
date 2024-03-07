/**
 * @file
 * @description Tests [POST] /webhooks/paddle route
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const request = require('supertest')
const expect = require('chai').expect
const sinon = require('sinon')

const sign = require('./lib/sign')
const config = require('../../../../config')
const { shared, seedDb, mockLogin, commonAssertions } = require('../../../test-util')
const deployer = require('../../../../app/lib/deployer')
const notifier = require('../../../../app/lib/notifier')

const publicKeyTesting = require('./lib/public-key')
const publicKeyPaddle = config.PADDLE_PUBLIC_KEY

const clientTrial = require('./fixtures/client-trial.json')
const clientSubscribed = require('./fixtures/client-subscribed.json')
const clientPastDue = require('./fixtures/client-past-due.json')
const clientCancelled = require('./fixtures/client-cancelled.json')
const clientResubscribed = require('./fixtures/client-resubscribed.json')

const webhookSubscriptionCreatedPaddleSignedJSON = require('./fixtures/webhook-subscription-created-paddle-signed.json')
const webhookUnsupportedPaymentRefundedPaddleSignedJSON = require('./fixtures/webhook-unsupported-payment-refunded-paddle-signed.json')

const webhookSubscriptionCreatedJSON = require('./fixtures/webhook-subscription-created.json')
const webhookSubscriptionUpdatedPastDueJSON = require('./fixtures/webhook-subscription-updated-past-due.json')
const webhookSubscriptionCancelledJSON = require('./fixtures/webhook-subscription-cancelled.json')
const webhookSubscriptionResubscribedJSON = require('./fixtures/webhook-subscription-resubscribed.json')
const webhookSubscriptionPaymentSucceededJSON = require('./fixtures/webhook-subscription-payment-succeeded.json')

module.exports = () => {
  describe('Create Paddle Webhook', () => {
    const url = '/webhooks/paddle'
    let userLogin

    describe('Valid requests signed by Paddle', () => {
      before(async function () {
        await seedDb()
        sinon.stub(deployer, 'placeOrder')
      })

      beforeEach(function () {
        sinon.spy(notifier, 'sendWebhookNotification')
        sinon.stub(notifier, 'sendNotification')
      })

      afterEach(function () {
        notifier.sendWebhookNotification.restore()
        notifier.sendNotification.restore()
      })

      after(function () {
        deployer.placeOrder.restore()
      })

      it('rejects valid unsupported event', function (done) {
        request
          .agent(shared.app)
          .post(url)
          .type('form')
          .send(webhookUnsupportedPaymentRefundedPaddleSignedJSON)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(422)
            commonAssertions.routeResponseHeaders(res)
            // response verification
            expect(res.body).to.be.an('object')
            expect(res.body.error).to.equal(true)
            expect(res.body.name).to.equal('ValidationError')
            expect(res.body.details).to.be.an('array')
            expect(res.body.details).to.have.length(1)
            expect(res.body.details[0].type).to.equal('any.allowOnly')
            expect(res.body.details[0].path).to.deep.equal(['alert_name'])
            expect(res.body.details[0].message).to.equal('"alert_name" is invalid')
            done()
          })
      })

      it('accepts valid data signed by paddle', function (done) {
        request
          .agent(shared.app)
          .post(url)
          .type('form')
          .send(webhookSubscriptionCreatedPaddleSignedJSON)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(200)
            commonAssertions.routeResponseHeaders(res)
            // response verification
            expect(res.body.error).to.equal(undefined)
            // verify notification has been sent
            sinon.assert.calledOnce(notifier.sendWebhookNotification)
            done()
          })
      })
    })

    async function makeRequest (payload) {
      return request
        .agent(shared.app)
        .post(url)
        .type('form')
        .send(payload)
    }

    async function beforeTest () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      config.PADDLE_PUBLIC_KEY = publicKeyTesting
      sinon.stub(deployer, 'placeOrder')
      sinon.spy(notifier, 'sendWebhookNotification')
      sinon.stub(notifier, 'sendNotification')
    }

    function afterTest () {
      config.PADDLE_PUBLIC_KEY = publicKeyPaddle
      deployer.placeOrder.restore()
      notifier.sendWebhookNotification.restore()
      notifier.sendNotification.restore()
    }

    function validateAlert ({ title, payload, clientId, initialClient, updatedClient, deployerRequired }) {
      // Create own sigature
      payload.p_signature = sign(payload, 'p_signature')

      describe(`${title} (approved client)`, () => {
        before(beforeTest)

        before(async () => {
          const ClientModel = mongoose.model('client')
          const client = new ClientModel({
            ...initialClient,
            _id: clientId
          })
          await client.save()
        })

        after(afterTest)

        it('rejects invalid JSON passthrough field', async function () {
          const invalidPayload = { ...payload, passthrough: 'foobar' }
          invalidPayload.p_signature = sign(invalidPayload, 'p_signature')
          const res = await makeRequest(invalidPayload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ValidationError')
          expect(res.body.details).to.be.an('array')
          expect(res.body.details).to.have.length(1)
          expect(res.body.details[0].type).to.equal('object.base')
          expect(res.body.details[0].path).to.deep.equal(['passthrough'])
          expect(res.body.details[0].message).to.equal('"passthrough" must be an object')
        })

        it('rejects missing client ID in passthrough field', async function () {
          const invalidPayload = {
            ...payload,
            passthrough: JSON.stringify({
              foobar: 'foobar'
            })
          }
          invalidPayload.p_signature = sign(invalidPayload, 'p_signature')
          const res = await makeRequest(invalidPayload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ValidationError')
          expect(res.body.details).to.be.an('array')
          expect(res.body.details).to.have.length(1)
          expect(res.body.details[0].type).to.equal('any.required')
          expect(res.body.details[0].path).to.deep.equal(['passthrough', 'client_id'])
          expect(res.body.details[0].message).to.equal('"client_id" is required')
        })

        it('rejects invalid client ID in passthrough field', async function () {
          const invalidPayload = {
            ...payload,
            passthrough: JSON.stringify({
              client_id: 'foobar'
            })
          }
          invalidPayload.p_signature = sign(invalidPayload, 'p_signature')
          const res = await makeRequest(invalidPayload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(404)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('NotFoundError')
          expect(res.body.message).to.equal('client not found')
        })

        it('rejects webhook for non-existent client', async function () {
          const invalidPayload = {
            ...payload,
            passthrough: JSON.stringify({
              client_id: '507f1f77bcf86cd7994390aa'
            })
          }
          invalidPayload.p_signature = sign(invalidPayload, 'p_signature')
          const res = await makeRequest(invalidPayload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(404)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('NotFoundError')
          expect(res.body.message).to.equal('client not found')
        })

        it('rejects invalid signature', async function () {
          const res = await makeRequest({ ...payload, p_signature: 'foobar' })
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ValidationError')
          expect(res.body.details).to.be.an('array')
          expect(res.body.details).to.have.length(1)
          expect(res.body.details[0].type).to.equal('string.unverifiedSignature')
          expect(res.body.details[0].path).to.deep.equal(['p_signature'])
          expect(res.body.details[0].message).to.equal('"p_signature" must be a valid signature')
        })

        it('rejects request if signature verification fails', async function () {
          const res = await makeRequest({ ...payload, foobar: 'foobar' })
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ValidationError')
          expect(res.body.details).to.be.an('array')
          expect(res.body.details).to.have.length(1)
          expect(res.body.details[0].type).to.equal('string.unverifiedSignature')
          expect(res.body.details[0].path).to.deep.equal(['p_signature'])
          expect(res.body.details[0].message).to.equal('"p_signature" must be a valid signature')
        })

        const accepTestCaseTitle = deployerRequired
          ? 'accepts valid data, gets updated client, places deployment order'
          : 'accepts valid data, gets updated client, does not place deployment order'

        it(accepTestCaseTitle, async function () {
          const resPost = await makeRequest(payload)

          expect(resPost).to.not.equal(null)
          expect(resPost.status).to.equal(200)
          commonAssertions.routeResponseHeaders(resPost)

          expect(resPost.body).to.be.an('object')
          expect(resPost.body.error).to.equal(undefined)

          const resGet = await request
            .agent(shared.app)
            .get(`/clients/${clientId}`)
            .set('Authorization', `Bearer ${userLogin.token}`)

          expect(resGet).to.not.equal(null)
          expect(resGet.status).to.equal(200)
          commonAssertions.routeResponseHeaders(resGet)

          expect(resGet.body).to.be.an('object')
          expect(resGet.body.error).to.equal(undefined)
          expect(resGet.body.created_at).to.be.a('string')
          expect(resGet.body.updated_at).to.be.a('string')
          expect(new Date(resGet.body.updated_at)).to.be.above(new Date(resGet.body.created_at))
          const relevantData = _.omit(resGet.body, 'id', 'created_at', 'updated_at')
          expect(relevantData).to.deep.equal(updatedClient, 'unexpected updated client data')

          // verify notification has been sent
          sinon.assert.calledOnce(notifier.sendWebhookNotification)

          if (deployerRequired) {
            sinon.assert.calledOnce(deployer.placeOrder)
            const targetClient = { ...updatedClient, _id: clientId }
            const clientArgumentModel = deployer.placeOrder.getCall(0).args[0]
            const clientArgumentObject = JSON.parse(JSON.stringify(clientArgumentModel))
            const relevantFieldsArgumentObject = _.omit(clientArgumentObject, 'created_at', 'updated_at', '__v')
            expect(relevantFieldsArgumentObject).to.deep.equal(targetClient, 'unexpected deployment order argument')
          } else {
            sinon.assert.notCalled(deployer.placeOrder)
          }
        })

        it('gets webhook log entry')
      })

      describe(`${title} (unapproved client)`, () => {
        before(beforeTest)

        before(async () => {
          const ClientModel = mongoose.model('client')
          const client = new ClientModel({
            ...initialClient,
            _id: clientId,
            approved: false
          })
          await client.save()
        })

        after(afterTest)

        it('rejects valid request for unapproved client', async function () {
          const res = await makeRequest(payload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(403)
          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ForbiddenError')
          expect(res.body.message).to.equal('client is unapproved')
        })
      })
    }

    validateAlert({
      title: 'Trial client subscribes (subcription_created)',
      payload: webhookSubscriptionCreatedJSON,
      clientId: '507f1f77bcf86cd799439060',
      initialClient: clientTrial,
      updatedClient: clientSubscribed,
      deployerRequired: true
    })

    validateAlert({
      title: 'Subscribed client subscription is past due (subscription_updated)',
      payload: webhookSubscriptionUpdatedPastDueJSON,
      clientId: '507f1f77bcf86cd799439060',
      initialClient: clientSubscribed,
      updatedClient: clientPastDue,
      deployerRequired: false
    })

    validateAlert({
      title: 'Past due client subscription canceled (subscription_cancelled)',
      payload: webhookSubscriptionCancelledJSON,
      clientId: '507f1f77bcf86cd799439060',
      initialClient: clientPastDue,
      updatedClient: clientCancelled,
      deployerRequired: true
    })

    validateAlert({
      title: 'Cancelled client re-subscribes (subscription_created)',
      payload: webhookSubscriptionResubscribedJSON,
      clientId: '507f1f77bcf86cd799439060',
      initialClient: clientCancelled,
      updatedClient: clientResubscribed,
      deployerRequired: true
    })

    validateAlert({
      title: 'Past due client subscription payment succeeds (subscription_payment_succeeded)',
      payload: webhookSubscriptionPaymentSucceededJSON,
      clientId: '507f1f77bcf86cd799439060',
      initialClient: clientPastDue,
      updatedClient: clientSubscribed,
      deployerRequired: false
    })
  })
}
