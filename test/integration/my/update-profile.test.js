/**
 * @file
 * @description Tests [PATCH] /my route
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const expect = require('chai').expect
const { shared, seedDb, mockLogin, commonAssertions } = require('../../test-util')
const validProfileUpdateJSON = require('./fixtures/profile-update-valid.json')

module.exports = () => {
  describe('Update My (Client Profile)', () => {
    const url = '/my'
    let userLogin, clientLogin
    before(async function () {
      await seedDb()
      userLogin = await mockLogin(shared.userData1, 'user')
      clientLogin = await mockLogin(shared.clientData1, 'client')
    })

    function makeRequest (payload, callback) {
      request
        .agent(shared.app)
        .patch(url)
        .set('Authorization', `Bearer ${clientLogin.token}`)
        .send(payload)
        .end(callback)
    }

    function validRequest (title, payload) {
      it(title, done => {
        const client = shared.clientData1
        makeRequest(payload, (err, res) => {
          // basic verification
          expect(err).to.equal(null)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(200)
          commonAssertions.routeResponseHeaders(res)

          // response verification
          expect(res.body).to.be.an('object')
          const updatedFields = Object.keys(payload)
          updatedFields.map(key => {
            expect(res.body[key]).to.equal(payload[key])
          })
          const expectedFields = [
            'name',
            'email',
            'organization',
            'country',
            'marketing_consent'
          ]
          const remainingFields = _.difference(expectedFields, updatedFields)
          remainingFields.map(key => {
            expect(res.body[key]).to.equal(client[key])
          })
          expect(res.body.deployment).to.be.an('object')
          expect(res.body.deployment).to.have.keys('trial', 'trial_end_date', 'domain')
          expect(res.body.deployment.trial).to.equal(client.deployment.trial)
          expect(res.body.deployment.trial_end_date).to.equal(client.deployment.trial_end_date)
          expect(res.body.deployment.domain).to.equal(client.deployment.domain)
          done()
        })
      })
    }

    function invalidRequest ({ title, payload, type, path, message }) {
      it(title, function (done) {
        makeRequest(payload, (err, res) => {
          // basic verification
          expect(err).to.equal(null)
          expect(res).to.not.equal(null)
          expect(res.status).to.equal(422)
          commonAssertions.routeResponseHeaders(res)

          // response verification
          const data = res.body
          expect(data.error).to.equal(true)
          expect(data.name).to.equal('ValidationError')
          expect(data.details).to.be.an('array').to.have.lengthOf(1)
          const error = data.details[0]
          if (type) {
            expect(error.type).to.eql(type)
          }
          if (path) {
            expect(error.path).to.eql(path)
          }
          if (message) {
            expect(error.message).to.equal(message)
          }
          done()
        })
      })
    }

    function invalidBooleanRequest ({ path, message }) {
      const pathReversed = [ ...path ].reverse()
      const invalidValues = ['true', 'false', 0, 1, '0', '1', 'FOOBAR']
      invalidValues.forEach(value => {
        let tempValue = value
        pathReversed.forEach(segment => {
          let innerOverride = {}
          innerOverride[segment] = tempValue
          tempValue = innerOverride
        })
        const payload = tempValue
        invalidRequest({
          title: `invalidates malformed boolean ${path.join('.')} (${typeof value}, ${JSON.stringify(value)})`,
          payload,
          path,
          message
        })
      })
    }

    describe('Invalid login', () => {
      it('rejects if not logged in', function (done) {
        const agent = request.agent(shared.app)
        agent
          .patch(url)
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
          .patch(url)
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

    describe('Valid data with client login', () => {
      beforeEach(async function () {
        await seedDb()
      })

      validRequest('updates client name', { name: 'Tony Stark' })
      validRequest('updates client organization', { organization: 'Avengers' })
      validRequest('updates client country', { country: 'BE' })
      validRequest('updates client marketing consent', { marketing_consent: false })
    })

    describe('Invalid data with client login', () => {
      // No extra fields allowed
      const extraFields = ['id', '_id', 'created_at', 'updated_at', 'foobar']
      extraFields.forEach(field => {
        const override = {}
        override[field] = 'foobar'
        invalidRequest({
          title: `invalidates redundant field ${field}`,
          payload: { ...validProfileUpdateJSON, ...override },
          path: [field],
          message: `"${field}" is not allowed`
        })
      })

      // name
      invalidRequest({
        title: 'invalidates name longer than 140 characters',
        payload: { name: 'a'.repeat(141) },
        path: ['name'],
        message: '"name" is too long'
      })

      // organization
      invalidRequest({
        title: 'invalidates organization longer than 140 characters',
        payload: { organization: 'a'.repeat(141) },
        path: ['organization'],
        message: '"organization" is too long'
      })

      // country
      const invalidCountries = ['us', 'USA', 'XX']
      invalidCountries.forEach(value => {
        invalidRequest({
          title: `invalidates country format not matching ISO 3166-1 alpha-2 (${typeof value}, ${JSON.stringify(value)})`,
          payload: { country: value },
          path: ['country'],
          message: '"country" needs to be a valid ISO 3166-1 alpha-2 country code'
        })
      })

      // marketing consent
      invalidBooleanRequest({
        path: ['marketing_consent'],
        message: '"marketing_consent" must be a boolean'
      })

      // deployment
      const invalidDeploymentValues = [true, 1, 'foobar', [], {}, { domain: 'testdomain' }]
      invalidDeploymentValues.forEach(value => {
        invalidRequest({
          title: `invalidates redundant deployment (${typeof value}, ${JSON.stringify(value)})`,
          payload: { deployment: value },
          path: ['deployment'],
          message: '"deployment" is not allowed'
        })
      })

      // subscriptions
      const invalidSubscriptionValues = [true, 1, 'foobar', [], {}, { status: 'active' }]
      invalidSubscriptionValues.forEach(value => {
        invalidRequest({
          title: `invalidates redundant subscriptions (${typeof value}, ${JSON.stringify(value)})`,
          payload: { subscriptions: value },
          path: ['subscriptions'],
          message: '"subscriptions" is not allowed'
        })
      })
    })
  })
}
