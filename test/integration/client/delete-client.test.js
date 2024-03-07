/**
 * @file
 * @description Tests [DELETE] /clients route
 */
'use strict'

const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

module.exports = () => {
  describe('Deletes Client', () => {
    const url = '/clients'

    describe('Valid', () => {
      let userLogin

      before(async function () {
        await seedDb()
        userLogin = await mockLogin(shared.userData1, 'user')
      })

      it('deletes client with user login', async function () {
        const client = shared.clientData2
        const res = await request.agent(shared.app)
          .delete(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(204)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.eql({})

        const resGet = await request
          .agent(shared.app)
          .get(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(resGet).to.not.equal(null)
        expect(resGet.status).to.equal(404)
        expect(resGet.body).to.deep.equal({
          error: true,
          name: 'NotFoundError',
          message: 'client not found',
          details: {}
        })
      })
    })

    describe('Invalid login', () => {
      let clientLogin

      before(async function () {
        await seedDb()
        clientLogin = await mockLogin(shared.clientData1, 'client')
      })

      it('rejects if not logged in', async function () {
        const client = shared.clientData1
        const res = await request.agent(shared.app)
          .delete(`${url}/${client._id}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(401)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'UnauthorizedError',
          message: 'User not found',
          details: {}
        })
      })

      it('rejects with client login', async function () {
        const client = shared.clientData1
        const res = await request.agent(shared.app)
          .delete(`${url}/${client._id}`)
          .set('Authorization', `Bearer ${clientLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(403)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'ForbiddenError',
          message: '',
          details: {}
        })
      })
    })

    describe('Non-existent client with user login', () => {
      let userLogin

      before(async function () {
        await seedDb()
        userLogin = await mockLogin(shared.userData1, 'user')
      })

      it('reports 404 Not Found for invalid ID', async function () {
        const res = await request.agent(shared.app)
          .delete(`${url}/foobar`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'NotFoundError',
          message: 'client not found',
          details: {}
        })
      })

      it('reports 404 Not Found for valid non-existent ID', async function () {
        const res = await request.agent(shared.app)
          .delete(`${url}/507f191e810c19729de860ea`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.deep.equal({
          error: true,
          name: 'NotFoundError',
          message: 'client not found',
          details: {}
        })
      })
    })
  })
}
