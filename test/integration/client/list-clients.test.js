/**
 * @file
 * @description Tests [GET] /clients route
 */
'use strict'

const request = require('supertest')
const chai = require('chai')
const chaiDateString = require('chai-date-string')
const expect = chai.expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')

chai.use(chaiDateString)

module.exports = () => {
  describe('List Clients', () => {
    const url = `/clients`
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    describe('Valid', () => {
      it('lists clients with user login', done => {
        const agent = request.agent(shared.app)
        agent
          .get(url)
          .set('Authorization', `Bearer ${userLogin.token}`)
          .end((err, res) => {
            // basic verification
            expect(err).to.equal(null)
            expect(res).to.not.equal(null)
            expect(res.status).to.equal(200)
            commonAssertions.routeResponseHeaders(res)

            // response verification
            const data = res.body
            expect(data).to.be.an('array').to.have.lengthOf(2)
            for (let client of data) {
              const expectedClient = (client.id === shared.clientData1._id) ? shared.clientData1 : shared.clientData2
              expect(client.id).to.equal(expectedClient._id)
              expect(client.name).to.equal(expectedClient.name)
              expect(client.email).to.equal(expectedClient.email)
              expect(client.email_confirmed).to.equal(expectedClient.email_confirmed)
              expect(client.organization).to.equal(expectedClient.organization)
              expect(client.country).to.equal(expectedClient.country)
              expect(client.consent).to.equal(expectedClient.consent)
              expect(client.marketing_consent).to.equal(expectedClient.marketing_consent)
              expect(client.deployment).to.deep.equal(expectedClient.deployment)
              expect(client.subscriptions).to.deep.equal(expectedClient.subscriptions)
              expect(client.created_at).to.be.a.dateString()
              expect(client.updated_at).to.be.a.dateString()
            }
            done()
          })
      })
    })

    describe('Invalid', () => {
      it('rejects if not logged in', done => {
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

      it('rejects with client login', done => {
        const agent = request.agent(shared.app)
        agent
          .get(url)
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
  })
}
