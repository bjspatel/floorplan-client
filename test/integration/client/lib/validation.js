/**
 * @file
 * @description Validation tests for /clients route
 */
'use strict'

const _ = require('lodash')
const assert = require('assert')
const { expect } = require('chai')
const { seedDb, commonAssertions } = require('../../../test-util')
const validClientTrialJSON = require('../fixtures/client-trial.json')

module.exports = ({ successStatusCode, makeRequest }) => {
  assert.equal(typeof successStatusCode, 'number')
  assert.ok([200, 201].includes(successStatusCode), 'unepected argument for success status code')
  assert.equal(typeof makeRequest, 'function')

  runTests()

  function validRequest ({ title, payload }) {
    it(title, async function () {
      await seedDb()
      const res = await makeRequest(payload)
      // basic verification
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(successStatusCode)
      commonAssertions.routeResponseHeaders(res)

      // response verification
      const data = res.body
      expect(data.id).to.not.equal(undefined)
      expect(data).to.not.have.property('error')
    })
  }

  function invalidRequest ({ title, payload, type, path, message }) {
    it(title, async function () {
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
        expect(error.type).to.equal(type)
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
      const override = tempValue
      invalidRequest({
        title: `invalidates malformed boolean ${path.join('.')} (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, override),
        path,
        message
      })
    })
  }

  function runTests () {
    it('invalidates empty request', async function () {
      const res = await makeRequest(undefined)
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
      expect(error.type).to.eql('any.required')
      expect(error.path).to.eql(['name'])
      expect(error.message).to.equal('"name" is required')
    })

    // All fields of the main object are required
    const fields = Object.keys(validClientTrialJSON)
    fields.forEach(field => {
      invalidRequest({
        title: `invalidates missing ${field}`,
        payload: _.omit(validClientTrialJSON, field),
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
        title: `invalidates redundant field ${field}`,
        payload: { ...validClientTrialJSON, ...override },
        path: [field],
        message: `"${field}" is not allowed`
      })
    })

    // All fields are required (deployment)
    const deploymentFields = Object.keys(validClientTrialJSON.deployment)
    deploymentFields.forEach(field => {
      invalidRequest({
        title: `invalidates missing deployment.${field}`,
        payload: {
          ...validClientTrialJSON,
          deployment: _.omit(validClientTrialJSON.deployment, field)
        },
        path: ['deployment', field],
        message: `"${field}" is required`
      })
    })

    // No extra fields allowed (deployment)
    const extraDeploymentFields = ['deployed_at', 'foobar']
    extraDeploymentFields.forEach(field => {
      const override = {}
      override[field] = 'foobar'
      invalidRequest({
        title: `invalidates redundant field deployment.${field}`,
        payload: { ...validClientTrialJSON, ...override },
        path: [field],
        message: `"${field}" is not allowed`
      })
    })

    // Format validation
    // "name"
    invalidRequest({
      title: 'invalidates name longer than 140 characters',
      payload: _.merge({}, validClientTrialJSON, { name: 'a'.repeat(141) }),
      path: ['name'],
      message: '"name" is too long'
    })

    // "email"
    invalidRequest({
      title: 'invalidates malformed email',
      payload: _.merge({}, validClientTrialJSON, { email: 'FOOBAR' }),
      path: ['email'],
      message: '"email" must be a valid email'
    })

    it('rejects existing email', async function () {
      await seedDb()
      const payload = { ...validClientTrialJSON, email: 'existing.subscription.client@deskradar.com' }
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

    // "email_confirmed"
    invalidBooleanRequest({
      path: ['email_confirmed'],
      message: '"email_confirmed" must be a boolean'
    })

    // "organization"
    invalidRequest({
      title: 'invalidates organization longer than 140 characters',
      payload: _.merge({}, validClientTrialJSON, { organization: 'a'.repeat(141) }),
      path: ['organization'],
      message: '"organization" is too long'
    })

    // "country"
    const invalidCountries = ['us', 'USA', 'XX']
    invalidCountries.forEach(value => {
      invalidRequest({
        title: `invalidates country format not matching ISO 3166-1 alpha-2 (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { country: value }),
        path: ['country'],
        message: '"country" needs to be a valid ISO 3166-1 alpha-2 country code'
      })
    })

    // "consent"
    invalidBooleanRequest({
      path: ['consent'],
      message: '"consent" must be a boolean'
    })

    // "marketing_consent"
    invalidBooleanRequest({
      path: ['marketing_consent'],
      message: '"marketing_consent" must be a boolean'
    })

    // approved
    invalidBooleanRequest({
      path: ['approved'],
      message: '"approved" must be a boolean'
    })

    // deployment "status"
    invalidRequest({
      title: 'invalidates malformed deployment.status',
      payload: _.merge({}, validClientTrialJSON, { deployment: { status: 'FOOBAR' } }),
      path: ['deployment', 'status'],
      message: '"status" is invalid'
    })

    const validStatus = ['non_existent', 'active', 'suspended']
    validStatus.forEach(value => {
      validRequest({
        title: `accepts deployment.status in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { status: value } })
      })
    })

    // deployment "domain"
    const invalidDomains = ['aa.aa', 'aaa.', '.aaa', 'aa-aa', '-aaa', 'aaa-']
    invalidDomains.forEach(value => {
      invalidRequest({
        title: `invalidates domain format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { domain: value } }),
        path: ['deployment', 'domain'],
        message: '"domain" is invalid'
      })
    })

    invalidRequest({
      title: 'invalidates domain longer than 32 characters',
      payload: _.merge({}, validClientTrialJSON, { deployment: { domain: 'aa' } }),
      path: ['deployment', 'domain'],
      message: '"domain" is too short'
    })

    invalidRequest({
      title: 'invalidates domain shorter than 3 characters',
      payload: _.merge({}, validClientTrialJSON, { deployment: { domain: 'a'.repeat(33) } }),
      path: ['deployment', 'domain'],
      message: '"domain" is too long'
    })

    it('rejects existing domain', async function () {
      await seedDb()
      const payload = _.merge({}, validClientTrialJSON, { deployment: { domain: 'existingsubscriptiondomain' } })
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
        title: `accepts deployment.domain in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { domain: value } })
      })
    })

    // deployment "app_version"
    const invalidVersionDataTypes = [0, 1, 1.5]
    invalidVersionDataTypes.forEach(value => {
      invalidRequest({
        title: `invalidates app_version format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { app_version: value } }),
        path: ['deployment', 'app_version'],
        message: '"app_version" must be a string'
      })
    })

    const invalidVersions = ['1.0', '.0.0', '100.0.0-dev', '1.0.0-live']
    invalidVersions.forEach(value => {
      invalidRequest({
        title: `invalidates app_version format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { app_version: value } }),
        path: ['deployment', 'app_version'],
        message: '"app_version" is invalid'
      })
    })

    const validVersions = ['1.0.0', '1.5.8', '99.99.99-dev']
    validVersions.forEach(value => {
      validRequest({
        title: `accepts app_version in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { app_version: value } })
      })
    })

    // deployment "trial"
    invalidBooleanRequest({
      path: ['deployment', 'trial'],
      message: '"trial" must be a boolean'
    })

    // deployment "trial_end_date"
    invalidRequest({
      title: 'invalidates malformed deployment.trial_end_date',
      payload: _.merge({}, validClientTrialJSON, { deployment: { trial_end_date: 'FOOBAR' } }),
      path: ['deployment', 'trial_end_date'],
      message: '"trial_end_date" must be a valid ISO 8601 date'
    })

    // deployment "node"
    const invalidNodeDataTypes = [true, 1, {}, []]
    invalidNodeDataTypes.forEach(value => {
      invalidRequest({
        title: `invalidates wrong data type for deployment.node (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { node: value } }),
        path: ['deployment', 'node'],
        message: '"node" must be a string'
      })
    })

    const invalidNodeValues = ['node net', 'node?net', 'домен', '域']
    invalidNodeValues.forEach(value => {
      invalidRequest({
        title: `invalidates deployment.node format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { node: value } }),
        path: ['deployment', 'node'],
        message: '"node" must be a valid hostname'
      })
    })

    invalidRequest({
      title: 'invalidates deployment.node longer than 32 characters',
      payload: _.merge({}, validClientTrialJSON, { deployment: { node: 'a'.repeat(30) + '.com' } }),
      path: ['deployment', 'node'],
      message: '"node" is too long'
    })

    const validNodeValues = ['', 'domain.com', 'node12.det.deskradar.com']
    validNodeValues.forEach(value => {
      validRequest({
        title: `accepts deployment.node in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { node: value } })
      })
    })

    // deployment "ipaddress"
    const invalidIPAddressDataTypes = [true, 1, {}, []]
    invalidIPAddressDataTypes.forEach(value => {
      invalidRequest({
        title: `invalidates wrong data type for deployment.ipaddress (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ipaddress: value } }),
        path: ['deployment', 'ipaddress'],
        message: '"ipaddress" must be a string'
      })
    })

    const invalidIPAddressValues = ['54', '54.230', '54.230.129', '999.15.16.17', 'FOOBAR']
    invalidIPAddressValues.forEach(value => {
      invalidRequest({
        title: `invalidates ipaddress format not matching pattern (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ipaddress: value } }),
        path: ['deployment', 'ipaddress'],
        message: '"ipaddress" must be a valid IP address'
      })
    })

    const validIPAddressValues = ['', '12.12.12.12']
    validIPAddressValues.forEach(value => {
      validRequest({
        title: `accepts deployment.ipaddress in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ipaddress: value } })
      })
    })

    // deployment "ssh_port"
    const invalidSSHPortDataTypes = [true, '55467', '', {}, []]
    invalidSSHPortDataTypes.forEach(value => {
      invalidRequest({
        title: `invalidates wrong data type for deployment.ssh_port (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ssh_port: value } }),
        path: ['deployment', 'ssh_port'],
        message: '"ssh_port" must be a number'
      })
    })

    const invalidSSHPortValues = [0, 65536]
    invalidSSHPortValues.forEach(value => {
      invalidRequest({
        title: `invalidates deployment.ssh_port format not in range 1024-65535 (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ssh_port: value } }),
        path: ['deployment', 'ssh_port'],
        message: '"ssh_port" must be a valid port number'
      })
    })

    const validSSHPortNumberValues = [1, 22, 1023, 65535]
    validSSHPortNumberValues.forEach(value => {
      validRequest({
        title: `accepts deployment.ssh_port in valid format (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { ssh_port: value } })
      })
    })

    // deployment "deployed_at"
    validRequest({
      title: 'accepts deployment.deployed_at in valid format',
      payload: _.merge({}, validClientTrialJSON, { deployment: { deployed_at: '2018-01-10T00:00:00.000Z' } })
    })

    const invalidDeployedAtValues = ['', 'FOOBAR', null]
    invalidDeployedAtValues.forEach(value => {
      invalidRequest({
        title: `invalidates malformed deployment.deployed_at (${typeof value}, ${JSON.stringify(value)})`,
        payload: _.merge({}, validClientTrialJSON, { deployment: { deployed_at: 'FOOBAR' } }),
        path: ['deployment', 'deployed_at'],
        message: '"deployed_at" must be a valid ISO 8601 date'
      })
    })
  }
}
