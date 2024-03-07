/**
 * @file
 * @description Tests [GET] /my route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const chai = require('chai')
const chaiDateString = require('chai-date-string')
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

const expect = chai.expect

chai.use(chaiDateString)

module.exports = () => {
  describe('Get My (Client Profile)', () => {
    const url = '/my'
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData2, 'client')
    })

    describe('Valid', () => {
      it('gets client profile with client login', function (done) {
        const agent = request.agent(shared.app)
        const client = shared.clientData2
        agent
          .get(url)
          .set('Authorization', `Bearer ${clientLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(200)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data).to.be.an('object')
            expect(data).to.have.keys(
              'id',
              'name',
              'email',
              'organization',
              'country',
              'marketing_consent',
              'updated_at',
              'subscriptions',
              'deployment'
            )
            expect(data.id).to.equal(client._id)
            expect(data.name).to.equal(client.name)
            expect(data.email).to.equal(client.email)
            expect(data.organization).to.equal(client.organization)
            expect(data.country).to.equal(client.country)
            expect(data.marketing_consent).to.equal(client.marketing_consent)
            expect(data.updated_at).to.be.a.dateString()
            expect(data.subscriptions).to.deep.equal(client.subscriptions)
            expect(data.deployment).to.deep.equal(_.pick(client.deployment, 'trial', 'trial_end_date', 'domain'))
            done()
          })
      })
    })

    describe('Invalid login', () => {
      it('rejects if not logged in', function (done) {
        const agent = request.agent(shared.app)
        agent
          .get(url)
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

      it('rejects with user login', function (done) {
        const agent = request.agent(shared.app)
        agent
          .get(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
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
  })
}
