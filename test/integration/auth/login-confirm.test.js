/**
 * @file
 * @description Tests [POST] /signup route
 */
'use strict'

const request = require('supertest')
const mongoose = require('mongoose')
const sinon = require('sinon')
const { expect } = require('chai')
const helpers = require('../../../app/routes/auth/actions/helpers')
const notifier = require('../../../app/lib/notifier')
const { shared, seedDb, commonAssertions } = require('../../test-util')
const tokens = require('./fixtures/tokens')

module.exports = () => {
  describe('Login Confirm', () => {
    const url = '/login/confirm'

    commonAssertions.describeOptionsRequest(url)

    before(async () => {
      await seedDb()
      const TokenModel = mongoose.model('token')
      for (const tokenName in tokens) {
        const tokenData = tokens[tokenName]
        const token = new TokenModel(tokenData)
        await token.save()
      }
    })

    describe('Valid', () => {
      beforeEach(() => {
        sinon.spy(notifier, 'sendLoginNotification')
        sinon.stub(notifier, 'sendNotification')
      })

      afterEach(() => {
        notifier.sendLoginNotification.restore()
        notifier.sendNotification.restore()
      })

      function validConfirmRequest (type, user, token) {
        it(`should repond with valid JWT (${type})`, async function () {
          // for client login, make sure email_confirmed is false before request
          if (type === 'client') {
            expect(user.email_confirmed).to.equal(false, 'initial email_confirmed field')
          }

          const res = await request
            .agent(shared.app)
            .get(`${url}/${token}`)

          expect(res).to.not.equal(null)
          expect(res.status).to.equal(200)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body).to.have.keys([
            'token',
            'valid_until'
          ])

          expect(res.body.token).to.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
          const tokenData = await helpers.verifyToken(res.body.token)
          expect(tokenData.sub).to.equal(user._id)
          expect(tokenData.typ).to.equal(type, 'unexpected type field')
          const nowTime = Math.floor(new Date().getTime() / 1000)
          const expiryTime = nowTime + 3600
          expect(tokenData.iat).to.be.closeTo(nowTime, 1)
          expect(tokenData.exp).to.be.closeTo(expiryTime, 1)

          const validUntilSeconds = Math.floor(new Date(res.body.valid_until).getTime() / 1000)
          expect(validUntilSeconds).to.be.closeTo(expiryTime, 1)

          // for client login should set email_confirmed field to true
          if (type === 'client') {
            const ClientModel = mongoose.model('client')
            const updatedClient = await ClientModel.findById(user._id)
            expect(updatedClient.email_confirmed).to.equal(true, 'email_confirmed fields after request')
          }

          // verifiy notifier has been called exactly once with correct arguments
          sinon.assert.calledOnce(notifier.sendLoginNotification)
          sinon.assert.calledWith(notifier.sendLoginNotification, type, user._id)
        })
      }

      validConfirmRequest('user', shared.userData1, tokens.validUserToken.token)
      validConfirmRequest('client', shared.clientData1, tokens.validClientToken.token)
    })

    describe('Invalid', () => {
      it('rejects missing token', async function () {
        const res = await request
          .agent(shared.app)
          .get(url)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('invalidates malformed token', async function () {
        const emailToken = 'abcd'
        const res = await request
          .agent(shared.app)
          .get(`${url}/${emailToken}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects expired token (user)', async function () {
        const emailToken = tokens.expiredUserToken.token
        const res = await request
          .agent(shared.app)
          .get(`${url}/${emailToken}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects expired token (client)', async function () {
        const emailToken = tokens.expiredClientToken.token
        const res = await request
          .agent(shared.app)
          .get(`${url}/${emailToken}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects non-existing user', async function () {
        const emailToken = tokens.nonExistingUserToken.token
        const res = await request
          .agent(shared.app)
          .get(`${url}/${emailToken}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects non-existing client', async function () {
        const emailToken = tokens.nonExistingClientToken.token
        const res = await request
          .agent(shared.app)
          .get(`${url}/${emailToken}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })
    })
  })
}
