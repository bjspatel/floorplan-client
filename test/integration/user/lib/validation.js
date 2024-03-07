/**
 * @file
 * @description Validation tests for /users route
 */
'use strict'

const _ = require('lodash')
const assert = require('assert')
const { expect } = require('chai')
const { commonAssertions } = require('../../../test-util')

const validUserJSON = require('../fixtures/user.json')

module.exports = makeRequest => {
  assert.equal(typeof makeRequest, 'function')

  runTests()

  function invalidRequest ({ title, payload, type, path, message }) {
    it(title, async function () {
      const res = await makeRequest(payload)
      expect(res).to.not.equal(null)
      expect(res.status).to.equal(422)
      commonAssertions.routeResponseHeaders(res)

      expect(res.body.error).to.equal(true)
      expect(res.body.name).to.equal('ValidationError')
      expect(res.body.details).to.be.an('array').to.have.lengthOf(1)
      expect(res.body.details[0]).to.be.an('object')
      if (type) {
        expect(res.body.details[0].type).to.equal(type)
      }
      if (path) {
        expect(res.body.details[0].path).to.eql(path)
      }
      if (message) {
        expect(res.body.details[0].message).to.equal(message)
      }
    })
  }

  function runTests () {
    // all fields are required
    const fields = Object.keys(validUserJSON)
    fields.forEach(field => {
      invalidRequest({
        title: `rejects missing ${field}`,
        payload: _.omit(validUserJSON, field),
        path: [field],
        message: `"${field}" is required`
      })
    })

    // no extra fields allowed
    const extraFields = ['id', '_id', 'created_at', 'updated_at', 'foobar']
    extraFields.forEach(field => {
      const override = {}
      override[field] = 'foobar'
      invalidRequest({
        title: `rejects redundant field ${field}`,
        payload: { ...validUserJSON, ...override },
        type: 'object.allowUnknown',
        path: [field],
        message: `"${field}" is not allowed`
      })
    })

    invalidRequest({
      title: 'rejects name longer than 140 characters',
      payload: { ...validUserJSON, name: 'a'.repeat(141) },
      type: 'string.max',
      path: ['name'],
      message: '"name" is too long'
    })

    invalidRequest({
      title: 'rejects malformed email',
      payload: { ...validUserJSON, email: 'new at gmail dot com' },
      type: 'string.email',
      path: ['email'],
      message: '"email" must be a valid email'
    })

    invalidRequest({
      title: 'rejects malformed role',
      payload: { ...validUserJSON, role: 'foobar' },
      type: 'any.allowOnly',
      path: ['role'],
      message: '"role" must be one of [admin]'
    })
  }
}
