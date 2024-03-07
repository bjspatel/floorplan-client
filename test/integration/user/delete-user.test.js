/**
 * @file
 * @description Tests [DELETE] /users route
 */
'use strict'

const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

module.exports = () => {
  describe('Deletes User', () => {
    const url = '/users'

    describe('Valid', () => {
      let userLogin

      before(async function () {
        await seedDb()
        userLogin = await mockLogin(shared.userData1, 'user')
      })

      it('deletes user with user login', async function () {
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .delete(`${url}/${user._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(204)
        commonAssertions.routeResponseHeaders(res)
        expect(res.body).to.eql({})
      })
    })

    describe('Invalid login', () => {
      let clientLogin

      before(async function () {
        await seedDb()
        clientLogin = await mockLogin(shared.clientData1, 'client')
      })

      it('rejects if not logged in', async function () {
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .delete(`${url}/${user._id}`)
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
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .delete(`${url}/${user._id}`)
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

    describe('Non-existent user with user login', () => {
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
          message: 'user not found',
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
          message: 'user not found',
          details: {}
        })
      })
    })
  })
}
