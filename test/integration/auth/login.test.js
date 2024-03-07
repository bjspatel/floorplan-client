/**
 * @file
 * @description Tests [POST] /signup route
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const moment = require('moment')
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')
const { shared, seedDb, commonAssertions } = require('../../test-util')
const mailer = require('../../../app/lib/mailer')

module.exports = () => {
  describe('Login', () => {
    const url = '/login'

    commonAssertions.describeOptionsRequest(url)

    describe('Valid requests', () => {
      let mailParams = {}

      beforeEach(async function () {
        await seedDb()
      })

      beforeEach(function () {
        sinon.stub(mailer, 'sendLoginMail')
        mailer.sendLoginMail.callsFake((user, link, expDate) => {
          mailParams.user = user
          mailParams.link = link
          mailParams.expDate = expDate
        })
      })

      afterEach(function () {
        mailParams = {}
        mailer.sendLoginMail.restore()
      })

      function testSuccessfulRequest (type, user) {
        it(`should send magic link (${type})`, async function () {
          const res = await request
            .agent(shared.app)
            .post(url)
            .send({
              type,
              email: user.email,
              url_template: 'https://my.deskradar.com/%token%'
            })

          expect(res).to.not.equal(null)
          expect(res.status).to.equal(202)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.success).to.equal(true)

          expect(mailer.sendLoginMail.callCount).to.equal(1)
          const expectedUser = user
          const actualUser = mailParams.user
          expect(actualUser).to.be.an('object')
          expect(actualUser._id.toString()).to.equal(expectedUser._id)
          expect(actualUser.email).to.equal(expectedUser.email)
          expect(actualUser.name).to.equal(expectedUser.name)
          expect(mailParams.link).to.match(/^https:\/\/my\.deskradar\.com\/[a-zA-Z0-9._-]+$/)
          const expDate = moment(mailParams.expDate)
          const date = moment()
          const expirationSeconds = expDate.diff(date, 'seconds')
          expect(expirationSeconds).to.be.within(3595, 3600)
        })
      }

      function testIgnoredRequest (type) {
        it(`should not send magic link for login attempt with non-existent email (${type})`, async function () {
          const res = await request
            .agent(shared.app)
            .post(url)
            .send({
              type,
              email: 'fake-email@deskradar.com',
              url_template: 'https://my.deskradar.com/%token%'
            })

          expect(res).to.not.equal(null)
          expect(res.status).to.equal(202)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.success).to.equal(true)
          expect(mailer.sendLoginMail.callCount).to.equal(0)
        })
      }

      function testFailedRepeatedRequest (type, user, user2) {
        it(`should explicitly reject if 3 tokens created within last hour (${type})`, async function () {
          const TokenModel = mongoose.model('token')
          const tokenData = { user_type: type, user_id: user._id }
          const createdMinutesAgo = [ 70, 30, 5 ]
          const tokenLifetimeMinutes = 60
          for (const min of createdMinutesAgo) {
            const token = new TokenModel({
              ...tokenData,
              created_at: moment().subtract(min, 'minutes'),
              expiry_date: moment().add(tokenLifetimeMinutes - min, 'minutes')
            })
            await token.save()
          }

          // make first request (should succeed)
          const res = await request
            .agent(shared.app)
            .post(url)
            .send({
              type,
              email: user.email,
              url_template: 'https://my.deskradar.com/%token%'
            })

          // verify success
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(202)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.success).to.equal(true)
          expect(mailer.sendLoginMail.callCount).to.equal(1)

          // make second request (should fail)
          const resFail = await request
            .agent(shared.app)
            .post(url)
            .send({
              type,
              email: user.email,
              url_template: 'https://my.deskradar.com/%token%'
            })

          // verify failure
          expect(resFail).to.not.equal(null)
          expect(resFail.status).to.equal(429)
          commonAssertions.routeResponseHeaders(resFail)

          expect(resFail.body).to.be.an('object')
          expect(resFail.body.error).to.equal(true)
          expect(resFail.body.name).to.equal('TooManyRequestsError')
          expect(resFail.body.message).to.equal('too many requests')
          expect(resFail.body.details).to.be.an('object')
          expect(resFail.body.details.retryAfter).to.equal(1800)
          expect(mailer.sendLoginMail.callCount).to.equal(1)

          // login with different user (should succeed)
          const resUser2 = await request
            .agent(shared.app)
            .post(url)
            .send({
              type,
              email: user2.email,
              url_template: 'https://my.deskradar.com/%token%'
            })

          // verify success
          expect(resUser2).to.not.equal(null)
          expect(resUser2.status).to.equal(202)
          expect(resUser2.body).to.be.an('object')
          expect(resUser2.body.success).to.equal(true)
          expect(mailer.sendLoginMail.callCount).to.equal(2)
        })
      }

      testSuccessfulRequest('user', shared.userData1)

      testSuccessfulRequest('client', shared.clientData1)

      testIgnoredRequest('user')

      testIgnoredRequest('client')

      testFailedRepeatedRequest('user', shared.userData1, shared.userData2)

      testFailedRepeatedRequest('client', shared.clientData1, shared.clientData2)

      it('should not send magic link for login attempt if client is unapproved', async function () {
        const ClientModel = mongoose.model('client')
        const clientData = _.merge({}, shared.clientData1, {
          _id: '5b56445974c888d85ec418a1',
          email: 'unapproved.client@deskradar.com',
          approved: false,
          deployment: {
            domain: 'unapprovedclientdomain'
          }
        })
        const client = new ClientModel(clientData)
        await client.save()
        const res = await request
          .agent(shared.app)
          .post(url)
          .send({
            type: 'client',
            email: 'unapproved.client@deskradar.com',
            url_template: 'https://my.deskradar.com/%token%'
          })

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(202)
        expect(res.body).to.be.an('object')
        expect(res.body.success).to.equal(true)
        expect(mailer.sendLoginMail.callCount).to.equal(0)
      })
    })

    describe('Invalid requests', () => {
      let mailParams = {}

      before(async function () {
        await seedDb()
      })

      beforeEach(function () {
        sinon.stub(mailer, 'sendLoginMail')
        mailer.sendLoginMail.callsFake((user, link, expDate) => {
          mailParams.user = user
          mailParams.link = link
          mailParams.expDate = expDate
        })
      })

      afterEach(function () {
        mailParams = {}
        mailer.sendLoginMail.restore()
      })

      function invalidRequest ({ title, payload, type, path, message }) {
        it(title, async function () {
          const res = await request
            .agent(shared.app)
            .post(url)
            .send(payload)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          expect(res.body).to.be.an('object')
          expect(res.body.error).to.equal(true)
          expect(res.body.name).to.equal('ValidationError')
          expect(res.body.details).to.be.an('array').to.have.lengthOf(1)
          expect(res.body.details[0]).to.eql({ type, path, message })
        })
      }

      const validInput = {
        type: 'client',
        email: 'test@mail.com',
        url_template: 'https://my.deskradar.com/%token%'
      }

      invalidRequest({
        title: 'rejects unknown type',
        payload: { ...validInput, type: 'fake-type' },
        type: 'any.allowOnly',
        path: ['type'],
        message: '"type" must be one of [client, user]'
      })

      invalidRequest({
        title: 'rejects missing type',
        payload: _.omit(validInput, 'type'),
        type: 'any.required',
        path: ['type'],
        message: '"type" is required'
      })

      const userTypes = ['user', 'client']
      userTypes.forEach(type => {
        describe(`Login type: ${type}`, () => {
          invalidRequest({
            title: 'rejects missing email',
            payload: _.omit({ ...validInput, type }, 'email'),
            type: 'any.required',
            path: ['email'],
            message: '"email" is required'
          })

          invalidRequest({
            title: 'rejects malformed email',
            payload: { ...validInput, type, email: 'new at mail dot com' },
            type: 'string.email',
            path: ['email'],
            message: '"email" must be a valid email'
          })

          invalidRequest({
            title: 'rejects missing url_template',
            payload: _.omit({ ...validInput, type }, 'url_template'),
            type: 'any.required',
            path: ['url_template'],
            message: '"url_template" is required'
          })

          const invalidURLTemplates = [
            'https://my.deskradar.com/',
            'http://my.deskradar.com/%token%',
            'https://my.deskradar.com%token%',
            'https://my.deskradar.com/%token',
            'https://deskradar.com/%token%',
            'https://my.radardesk.com/%token%',
            'https://my.deskradar.com.somedomain.com/%token%'
          ]
          invalidURLTemplates.forEach(value => {
            invalidRequest({
              title: `rejects invalid URL template (${typeof value}, ${JSON.stringify(value)})`,
              payload: { ...validInput, type, url_template: value },
              type: 'string.regex.base',
              path: ['url_template'],
              message: '"url_template" must be a valid url template'
            })
          })
        })
      })
    })
  })
}
