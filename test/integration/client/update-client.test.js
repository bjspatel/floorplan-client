/**
 * @file
 * @description Tests [PUT] /clients route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const validation = require('./lib/validation')
const validClientSubscriptionJSON = require('./fixtures/client-subscription.json')
const validClientSubscriptionUpdatedJSON = require('./fixtures/client-subscription-updated.json')

module.exports = () => {
  describe('Update Client', () => {
    const url = '/clients'
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid data with user login', () => {
      beforeEach(async function () {
        await seedDb()
      })

      it('updates client', async function () {
        const agent = request.agent(shared.app)
        const input = Object.assign({}, validClientSubscriptionUpdatedJSON)
        const client = shared.clientData1
        const res = await agent
          .put(`${url}/${client._id}`)
          .send(input)
          .set('Authorization', `Bearer ${userLogin.token}`)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        const relevantData = _.omit(res.body, 'id', 'created_at', 'updated_at')
        expect(relevantData).to.deep.equal(input)
      })

      it('removes subscriptions', async function () {
        const client = shared.clientData2

        // make sure the client has subscriptions before update
        const resGet = await request.agent(shared.app)
          .get(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)

        // basic verification
        expect(resGet).to.not.equal(null)
        expect(resGet.status).to.equal(200)
        commonAssertions.routeResponseHeaders(resGet)

        // response verification
        expect(resGet.body.subscriptions).to.be.an('array')
        expect(resGet.body.subscriptions).to.have.lengthOf(1)

        // perform update
        const input = Object.assign({}, validClientSubscriptionJSON)
        input.subscriptions = []
        const res = await request.agent(shared.app)
          .put(`${url}/${client._id}`)
          .send(input)
          .set('Authorization', `Bearer ${userLogin.token}`)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        const relevantData = _.omit(res.body, 'id', 'created_at', 'updated_at')
        expect(relevantData).to.deep.equal(input)
      })
    })

    describe('Non-existent client with user login', () => {
      it('reports 404 Not Found for invalid ID', done => {
        const input = validClientSubscriptionJSON
        request
          .agent(shared.app)
          .put(`${url}/foobar`)
          .send(input)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(404)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.error).to.equal(true)
            expect(data.name).to.equal('NotFoundError')
            done()
          })
      })

      it('reports 404 Not Found for valid non-existent ID', done => {
        const input = validClientSubscriptionJSON
        request
          .agent(shared.app)
          .put(`${url}/507f191e810c19729de860ea`)
          .send(input)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(404)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.error).to.equal(true)
            expect(data.name).to.equal('NotFoundError')
            done()
          })
      })
    })

    describe('Invalid login', () => {
      it('rejects if not logged in', done => {
        const agent = request.agent(shared.app)
        const client = shared.clientData1
        agent
          .put(`${url}/${client._id}`)
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
        const client = shared.clientData1
        agent
          .put(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${clientLogin.token}`)
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
        successStatusCode: 200,
        makeRequest (payload) {
          const client = shared.clientData1
          return request
            .agent(shared.app)
            .put(`${url}/${client._id}`)
            .set('Authorization', `Bearer ${userLogin.token}`)
            .send(payload)
        }
      })
    })
  })
}
