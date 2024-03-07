/**
 * @file
 * @description Tests [GET] /confirm-email/{token} route
 */
'use strict'

const mongoose = require('mongoose')
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')
const { shared, seedDb, commonAssertions } = require('../../test-util')
const mailer = require('../../../app/lib/mailer')
const notifier = require('../../../app/lib/notifier')
const tokens = require('./fixtures/tokens')

module.exports = () => {
  describe('Confirm email with verification token', () => {
    const url = '/signup/confirm'

    commonAssertions.describeOptionsRequest(url)

    async function makeRequest (tokenURL) {
      return request
        .agent(shared.app)
        .get(tokenURL)
    }

    beforeEach(async () => {
      await seedDb()
      const VerificationTokenModel = mongoose.model('verificationtoken')
      for (const tokenName in tokens) {
        const tokenData = tokens[tokenName]
        const verificationToken = new VerificationTokenModel(tokenData)
        await verificationToken.save()
      }
    })

    beforeEach(async () => {
      sinon.stub(mailer, 'sendMail')
      sinon.spy(notifier, 'sendClientEmailConfirmedNotification')
      sinon.stub(notifier, 'sendNotification')
    })

    afterEach(() => {
      mailer.sendMail.restore()
      notifier.sendClientEmailConfirmedNotification.restore()
      notifier.sendNotification.restore()
    })

    it('should reject missing token with 404 status code', async function () {
      const res = await makeRequest(url)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(404)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('NotFoundError')
      expect(res.body.message).to.equal('route not found')
    })

    it('should reject token for non-existing client with 404 status code', async function () {
      const res = await makeRequest(`${url}/${tokens.nonExistentClientTokenValid.token}`)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(404)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('NotFoundError')
      expect(res.body.message).to.equal('client not found')
    })

    it('should reject malformed token with 422 status code', async function () {
      const res = await makeRequest(`${url}/foobar`)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(422)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('ValidationError')
      expect(res.body.details).to.be.an('array')
      expect(res.body.details[0]).to.be.an('object')
      expect(res.body.details[0].type).to.equal('string.regex.base')
      expect(res.body.details[0].path).to.deep.equal(['token'])
      expect(res.body.details[0].message).to.equal('"token" is invalid')
    })

    it('should reject non-existent token with 404 status code', async function () {
      const res = await makeRequest(`${url}/${tokens.client1TokenExpired1.token.split('').reverse().join('')}`)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(404)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('NotFoundError')
      expect(res.body.message).to.equal('token not found')
    })

    it('should reject expired token with 404 status code', async function () {
      const res = await makeRequest(`${url}/${tokens.client1TokenExpired1.token}`)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(404)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('NotFoundError')
      expect(res.body.message).to.equal('token not found')
    })

    it('should accept valid token, confirm email on relevant client, remove the token, send confirmation email to client, send admin notification', async function () {
      const validToken = tokens.client1TokenValid
      const ClientModel = mongoose.model('client')

      // initial client state
      const clientBefore = await ClientModel.findById(validToken.client_id)
      expect(clientBefore.email_confirmed).to.equal(false, 'exected email_confirmed to be false before call')

      // make request
      const res = await makeRequest(`${url}/${validToken.token}`)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(200)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body).to.be.an('object')
      expect(res.body.success).to.equal(true)

      // client should be updated
      const client = await ClientModel.findById(validToken.client_id)
      expect(client.email_confirmed).to.equal(true, 'exected email_confirmed to be true after call')

      // token should be removed
      const VerificationTokenModel = mongoose.model('verificationtoken')
      const verificationToken = await VerificationTokenModel.findById(validToken._id)
      expect(verificationToken).to.equal(null, 'token expected to be removed after successfull verification')

      // verify mailer has been called exactly once with correct arguments
      const expectedEmailData = {
        event: 'SIGNUP_RECEIVED',
        account: client.deployment.domain,
        email: client.email,
        name: client.name
      }
      sinon.assert.calledOnce(mailer.sendMail)
      sinon.assert.calledWith(mailer.sendMail, expectedEmailData)

      // verifiy notifier has been called exactly once with correct arguments
      sinon.assert.calledOnce(notifier.sendClientEmailConfirmedNotification)
      sinon.assert.calledWith(notifier.sendClientEmailConfirmedNotification, client.id)
    })
  })
}
