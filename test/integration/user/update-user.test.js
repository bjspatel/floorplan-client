/**
 * @file
 * @description Tests [PUT] /users route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const validation = require('./lib/validation')

const validUserJSON = require('./fixtures/user.json')

module.exports = () => {
  describe('Update User', () => {
    const url = '/users'
    let userLogin, clientLogin

    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid data with user login', () => {
      it('updates user', async function () {
        const input = { ...validUserJSON, name: 'John Jackman', email: 'john.jackman@mail.com' }
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .put(`${url}/${user._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(input)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)
        const relevantData = _.omit(res.body, 'created_at', 'updated_at')
        const targetData = { ...input, id: user._id }
        expect(relevantData).to.deep.equal(targetData)
      })
    })

    describe('Non-existent user with user login', () => {
      it('reports 404 Not Found for invalid ID', async function () {
        const input = { ...validUserJSON }
        const res = await request.agent(shared.app)
          .put(`${url}/foobar`)
          .send(input)
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
        const input = { ...validUserJSON }
        const res = await request.agent(shared.app)
          .put(`${url}/507f191e810c19729de860ea`)
          .send(input)
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

    describe('Valid data with invalid login', () => {
      it('rejects if not logged in', async function () {
        const input = { ...validUserJSON }
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .put(`${url}/${user._id}`)
          .send(input)
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
        const input = { ...validUserJSON }
        const user = shared.userData1
        const res = await request.agent(shared.app)
          .put(`${url}/${user._id}`)
          .set('Authorization', `Bearer ${clientLogin.token}`)
          .send(input)
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

    describe('Invalid data', () => {
      it('rejects existing email', async function () {
        const input = { ...validUserJSON, email: shared.userData2.email }
        const res = await request.agent(shared.app)
          .put(`${url}/${shared.userData1._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(input)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(422)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ValidationError')
        expect(res.body.message).to.equal('user with this email already exists')
      })

      validation(function makeRequest (payload) {
        return request
          .agent(shared.app)
          .put(`${url}/${shared.userData1._id}`)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(payload)
      })
    })
  })
}
