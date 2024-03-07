/**
 * @file
 * @description Tests [POST] /clients route
 */
'use strict'

const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const validation = require('./lib/validation')
const validClientTrialJSON = require('./fixtures/client-trial.json')
const validClientSubscriptionJSON = require('./fixtures/client-subscription.json')

module.exports = () => {
  describe('Create Client', () => {
    const url = '/clients'
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid data with user login', () => {
      it('creates trial client', done => {
        const agent = request.agent(shared.app)
        const input = validClientTrialJSON
        agent
          .post(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(input)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(201)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.email).to.equal(input.email)
            expect(data.id).to.not.equal(undefined)
            done()
          })
      })

      it('creates subscription client', done => {
        const agent = request.agent(shared.app)
        const input = validClientSubscriptionJSON
        agent
          .post(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(input)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(201)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.email).to.equal(input.email)
            expect(data.subscriptionStatus).to.equal(input.subscriptionStatus)
            done()
          })
      })
    })

    describe('Valid data with client login', () => {
      it('rejects if not logged in', done => {
        const agent = request.agent(shared.app)
        const input = validClientTrialJSON
        agent
          .post(url)
          .send(input)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(401)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.error).to.equal(true)
            expect(data.name).to.equal('UnauthorizedError')
            done()
          })
      })

      it('rejects with client login', done => {
        const agent = request.agent(shared.app)
        const input = validClientTrialJSON
        agent
          .post(url)
          .set('Authorization', `Bearer ${clientLogin.token}`)
          .send(input)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(403)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.error).to.equal(true)
            expect(data.name).to.equal('ForbiddenError')
            done()
          })
      })
    })

    describe('Invalid data with user login', () => {
      validation({
        successStatusCode: 201,
        makeRequest (payload) {
          return request
            .agent(shared.app)
            .post(url)
            .set('Authorization', `Bearer ${userLogin.token}`)
            .send(payload)
        }
      })
    })
  })
}
