/**
 * @file
 * @description Tests [POST] /signup route
 */
'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')
const config = require('../../../config')
const { shared, seedDb, dropDb, commonAssertions } = require('../../test-util')
const mailer = require('../../../app/lib/mailer')
const notifier = require('../../../app/lib/notifier')

const validSignupJSON = require('./fixtures/valid-signup.json')
const expectedClientDataJSON = require('./fixtures/expected-client-data.json')

module.exports = () => {
  describe('Create account', () => {
    const url = '/signup'

    commonAssertions.describeOptionsRequest(url)

    async function makeRequest (payload) {
      return request
        .agent(shared.app)
        .post(url)
        .send(payload)
    }

    function validRequest ({ title, payload }) {
      it(title, async function () {
        const res = await makeRequest(payload)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        expect(res.body).to.be.an('object')
        expect(res.body.success).to.equal(true)
      })
    }

    function invalidRequest ({ title, payload, type, path, message, only }) {
      const f = only ? it.only : it
      f(title, async function () {
        const res = await makeRequest(payload)

        // basic verification
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
        const payload = _.merge({}, validSignupJSON, tempValue)
        invalidRequest({
          title: `rejects malformed boolean ${path.join('.')} (${typeof value}, ${JSON.stringify(value)})`,
          payload,
          path,
          message
        })
      })
    }

    describe('Invalid data', () => {
      // All fields of the main object are required
      const fields = Object.keys(validSignupJSON)
      fields.forEach(field => {
        invalidRequest({
          title: `rejects missing ${field}`,
          payload: _.omit(validSignupJSON, field),
          path: [field],
          message: `"${field}" is required`
        })
      })

      // No extra fields allowed
      const extraFields = ['id', '_id', 'created_at', 'updated_at', 'foobar']
      extraFields.forEach(field => {
        const override = {}
        override[field] = 'foobar'
        invalidRequest({
          title: `rejects redundant field ${field}`,
          payload: { ...validSignupJSON, ...override },
          path: [field],
          message: `"${field}" is not allowed`
        })
      })

      // name
      invalidRequest({
        title: 'rejects name longer than 140 characters',
        payload: { ...validSignupJSON, name: 'a'.repeat(141) },
        type: 'string.max',
        path: ['name'],
        message: '"name" is too long'
      })

      // organization
      invalidRequest({
        title: 'rejects organization longer than 140 characters',
        payload: { ...validSignupJSON, organization: 'a'.repeat(141) },
        type: 'string.max',
        path: ['organization'],
        message: '"organization" is too long'
      })

      // country
      const invalidCountries = ['us', 'USA', 'XX']
      invalidCountries.forEach(value => {
        invalidRequest({
          title: `rejects country format not matching ISO 3166-1 alpha-2 (${typeof value}, ${JSON.stringify(value)})`,
          payload: { ...validSignupJSON, country: value },
          type: 'string.countryCode',
          path: ['country'],
          message: '"country" needs to be a valid ISO 3166-1 alpha-2 country code'
        })
      })

      // consent
      invalidBooleanRequest({
        path: ['consent'],
        message: '"consent" must be a boolean'
      })

      // marketing consent
      invalidBooleanRequest({
        path: ['marketing_consent'],
        message: '"marketing_consent" must be a boolean'
      })

      // email
      invalidRequest({
        title: 'rejects malformed email',
        payload: { ...validSignupJSON, email: 'FOOBAR' },
        type: 'string.email',
        path: ['email'],
        message: '"email" must be a valid email'
      })

      // domain
      const invalidDomains = ['aa.aa', 'aaa.', '.aaa', 'aa-aa', '-aaa', 'aaa-']
      invalidDomains.forEach(value => {
        invalidRequest({
          title: `rejects domain format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
          payload: { ...validSignupJSON, domain: value },
          type: 'string.regex.base',
          path: ['domain'],
          message: '"domain" is invalid'
        })
      })

      invalidRequest({
        title: 'rejects domain shorter than 3 characters',
        payload: { ...validSignupJSON, domain: 'aa' },
        type: 'string.min',
        path: ['domain'],
        message: '"domain" is too short'
      })

      invalidRequest({
        title: 'rejects domain longer than 32 characters',
        payload: { ...validSignupJSON, domain: 'a'.repeat(33) },
        type: 'string.max',
        path: ['domain'],
        message: '"domain" is too long'
      })
    })

    describe('Valid data', () => {
      beforeEach(async () => {
        await seedDb()
        sinon.stub(mailer, 'sendMail')
        sinon.spy(notifier, 'sendClientSignupNotification')
        sinon.stub(notifier, 'sendNotification')
      })

      afterEach(() => {
        mailer.sendMail.restore()
        notifier.sendClientSignupNotification.restore()
        notifier.sendNotification.restore()
      })

      it('rejects existing email', async function () {
        const payload = { ...validSignupJSON, email: 'existing.trial.client@deskradar.com' }
        const res = await makeRequest(payload)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(422)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ValidationError')
        expect(res.body.message).to.equal('email is already registered')
        expect(res.body.details).to.be.an('object')
        expect(res.body.details).to.deep.equal({})
      })

      it('rejects existing email (mixed case)', async function () {
        const payload = { ...validSignupJSON, email: 'Existing.Trial.Client@Deskradar.Com' }
        const res = await makeRequest(payload)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(422)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ValidationError')
        expect(res.body.message).to.equal('email is already registered')
        expect(res.body.details).to.be.an('object')
        expect(res.body.details).to.deep.equal({})
      })

      it('rejects existing domain', async function () {
        const payload = { ...validSignupJSON, domain: 'existingtrialdomain' }
        const res = await makeRequest(payload)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(422)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('ValidationError')
        expect(res.body.message).to.equal('domain is already taken')
        expect(res.body.details).to.be.an('object')
        expect(res.body.details).to.deep.equal({})
      })

      const validDomains = ['aaa', 'aa0', '123']
      validDomains.forEach(value => {
        validRequest({
          title: `accepts domain in valid format (${typeof value}, ${JSON.stringify(value)})`,
          payload: { ...validSignupJSON, domain: value }
        })
      })

      it('creates account with valid data, creates verification token, sends verification email, sends admin notification', async function () {
        await dropDb()
        const res = await makeRequest(validSignupJSON)

        // basic verification
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(200)
        commonAssertions.routeResponseHeaders(res)

        // response verification
        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(undefined)
        expect(res.body.success).to.equal(true)

        // verify the newly created client, exclude dynamic and irrelevant fields
        const ClientModel = mongoose.model('client')
        const client = await ClientModel.findOne({})
        const clientObject = JSON.parse(JSON.stringify(client))
        const clientRelevantFields = _.omit(clientObject, '_id', '__v', 'updated_at', 'created_at', 'deployment.trial_end_date')
        expect(clientRelevantFields).to.deep.equal(expectedClientDataJSON)

        // verify the verification token has been created for current client
        const VerificationTokenModel = mongoose.model('verificationtoken')
        const verificationToken = await VerificationTokenModel.findOne({ client_id: client.id })
        expect(verificationToken).not.to.equal(null)
        expect(verificationToken.token).to.be.a('string').that.has.lengthOf(64)

        // verify mailer has been called exactly once with correct arguments
        const expectedEmailData = {
          event: 'EMAIL_CONFIRM',
          link: config.EMAIL_VERIFICATION_URL_TEMPLATE.replace('%token%', verificationToken.token),
          email: expectedClientDataJSON.email,
          name: expectedClientDataJSON.name,
          date: verificationToken.expiry_date.toISOString()
        }
        sinon.assert.calledOnce(mailer.sendMail)
        sinon.assert.calledWith(mailer.sendMail, expectedEmailData)

        // verify notifier has been called exactly once with correct arguments
        sinon.assert.calledOnce(notifier.sendClientSignupNotification)
        sinon.assert.calledWith(notifier.sendClientSignupNotification, client.id)
      })
    })
  })
}
