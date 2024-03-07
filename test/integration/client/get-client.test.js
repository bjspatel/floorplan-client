/**
 * @file
 * @description Tests [GET] /clients route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const chai = require('chai')
const chaiDateString = require('chai-date-string')
const expect = chai.expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

chai.use(chaiDateString)

module.exports = () => {
  describe('Get Client', () => {
    const url = `/clients`
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid', () => {
      it('gets client with user login', done => {
        const agent = request.agent(shared.app)
        const client = shared.clientData2
        agent
          .get(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(200)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            expect(res.body.id).to.equal(client._id)
            expect(res.body.created_at).to.be.a.dateString()
            expect(res.body.updated_at).to.be.a.dateString()
            const prestineResult = _.omit(res.body, 'id', 'created_at', 'updated_at')
            const prestineTarget = _.omit({ ...client }, '_id')
            expect(prestineResult).to.deep.equal(prestineTarget)
            done()
          })
      })
    })

    describe('Invalid login', () => {
      it('rejects if not logged in', done => {
        const agent = request.agent(shared.app)
        const client = shared.clientData1
        agent
          .get(`${url}/${client._id}`)
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
          .get(`${url}/${client._id}`)
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

    describe('Non-existent client with user login', () => {
      it('reports 404 Not Found for invalid ID', done => {
        const agent = request.agent(shared.app)
        agent
          .get(`${url}/foobar`)
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
        const agent = request.agent(shared.app)
        agent
          .get(`${url}/507f191e810c19729de860ea`)
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
  })
}
