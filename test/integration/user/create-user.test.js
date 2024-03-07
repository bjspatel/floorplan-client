/**
 * @file
 * @description Tests [POST] /users route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const validation = require('./lib/validation')

const validUserJSON = require('./fixtures/user.json')

module.exports = () => {
  describe('Create User', () => {
    const url = '/users'
    let userLogin, clientLogin

    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid data with user login', () => {
      it('creates user', async function () {
        const input = { ...validUserJSON }
        const res = await request.agent(shared.app)
          .post(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(input)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(201)
        commonAssertions.routeResponseHeaders(res)
        const relevantFields = _.omit(res.body, 'id', 'created_at', 'updated_at')
        expect(relevantFields).to.deep.equal(input)
      })
    })

    describe('Valid data with invalid login', () => {
      it('rejects if not logged in', async function () {
        const res = await request.agent(shared.app)
          .post(url)
          .send(validUserJSON)
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
          .post(url)
          .set('Authorization', `Bearer ${clientLogin.token}`)
          .send(validUserJSON)
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
        const input = { ...validUserJSON, email: shared.userData1.email }
        const res = await request.agent(shared.app)
          .post(url)
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
          .post(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .send(payload)
      })
    })
  })
}
