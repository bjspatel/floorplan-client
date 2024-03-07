/**
 * @file
 * @description Tests [GET] /users route
 */
'use strict'

const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

module.exports = () => {
  describe('Get User', () => {
    const url = '/users'
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid', () => {
      it('gets user with user login', done => {
        const agent = request.agent(shared.app)
        const user = shared.userData1
        agent
          .get(`${url}/${user._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(200)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data.id).to.equal(user._id)
            expect(data.email).to.equal(user.email)
            expect(data.name).to.equal(user.name)
            done()
          })
      })
    })

    describe('Invalid', () => {
      it('rejects if not logged in', done => {
        const agent = request.agent(shared.app)
        const user = shared.userData1
        agent
          .get(`${url}/${user._id}`)
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
        const user = shared.userData1
        agent
          .get(`${url}/${user._id}`)
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

    describe('Non-existent user with user login', () => {
      it('reports 404 Not Found for invalid ID', async function () {
        const res = await request.agent(shared.app)
          .get(`${url}/foobar`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'NotFoundError',
          message: 'user not found',
          details: {}
        })
      })

      it('reports 404 Not Found for valid non-existent ID', async function () {
        const res = await request.agent(shared.app)
          .get(`${url}/507f191e810c19729de860ea`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'NotFoundError',
          message: 'user not found',
          details: {}
        })
      })
    })
  })
}
