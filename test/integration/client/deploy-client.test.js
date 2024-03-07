/**
 * @file
 * @description Tests [PUT] /clients/{id}/deploy route
 */
'use strict'

const _ = require('lodash')
const sinon = require('sinon')
const request = require('supertest')
const { expect } = require('chai')
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const deployer = require('../../../app/lib/deployer')

module.exports = () => {
  describe('Deploy Client', () => {
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    beforeEach(() => {
      sinon.stub(deployer, 'placeOrder')
    })

    afterEach(() => {
      deployer.placeOrder.restore()
    })

    describe('Valid', () => {
      it('places deployment order', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/${shared.clientData1._id}/deploy`)
          .set('Authorization', `Bearer ${userLogin.token}`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.success).to.equal(true)

        sinon.assert.calledOnce(deployer.placeOrder)
        const targetClient = { ...shared.clientData1 }
        const clientArgumentModel = deployer.placeOrder.getCall(0).args[0]
        const clientArgumentObject = JSON.parse(JSON.stringify(clientArgumentModel))
        const relevantFieldsArgumentObject = _.omit(clientArgumentObject, 'created_at', 'updated_at', '__v')
        expect(relevantFieldsArgumentObject).to.deep.equal(targetClient)
      })
    })

    describe('Invalid login', () => {
      it('rejects if not logged in', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/${shared.clientData1._id}/deploy`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(401)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('UnauthorizedError')
      })

      it('rejects with client login', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/${shared.clientData1._id}/deploy`)
          .set('Authorization', `Bearer ${clientLogin.token}`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(403)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ForbiddenError')
      })
    })

    describe('Invalid data', () => {
      it('rejects non-existent client', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/507f191e810c19729de860ea/deploy`)
          .set('Authorization', `Bearer ${userLogin.token}`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects invalid client ID', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/foobar/deploy`)
          .set('Authorization', `Bearer ${userLogin.token}`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })

      it('rejects with unknown fields', async function () {
        const res = await request
          .agent(shared.app)
          .put(`/clients/${shared.clientData1._id}/deploy`)
          .send({ foobar: 'bzrbaz' })
          .set('Authorization', `Bearer ${userLogin.token}`)

        expect(res).to.not.equal(null)
        expect(res.status).to.equal(422)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ValidationError')
      })
    })
  })
}
