/**
 * @file
 * @description Tests [GET] /users route
 */
'use strict'

const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

module.exports = () => {
  describe('List Users', () => {
    const url = '/users'
    let userLogin, clientLogin

    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid', () => {
      it('lists users with user login', async function () {
        const res = await request.agent(shared.app)
          .get(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('array').to.have.lengthOf(2)
        for (let user of res.body) {
          const expectedUser = (user.id === shared.userData1._id) ? shared.userData1 : shared.userData2
          expect(user.id).to.equal(expectedUser._id)
          expect(user.email).to.equal(expectedUser.email)
          expect(user.name).to.equal(expectedUser.name)
        }
      })
    })

    describe('Invalid', () => {
      it('rejects if not logged in', async function () {
        const res = await request.agent(shared.app)
          .get(url)
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
        const res = await request.agent(shared.app)
          .get(url)
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
  })
}
