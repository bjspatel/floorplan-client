/**
 * @file
 * @description Module for asserting response headers
 */
'use strict'

const _ = require('lodash')
const request = require('supertest')
const { expect } = require('chai')
const shared = require('./shared')

function describeOptionsRequest (url) {
  describe('CORS & XSS protection', () => {
    it(`responds to OPTIONS request on '${url}' with expected headers`, async function () {
      const res = await request
        .agent(shared.app)
        .options(url)

      expect(res).to.not.equal(null)
      expect(res.status).to.equal(204)

      expect(res.body).to.be.an('object')
      expect(res.body).to.deep.equal({})

      const relevantHeaders = _.omit(res.headers, [
        'connection',
        'content-length',
        'content-type',
        'date'
      ])
      expect(relevantHeaders).to.deep.equal({
        'access-control-allow-headers': 'Content-Type,Authorization',
        'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'access-control-allow-origin': '*',
        'strict-transport-security': 'max-age=15552000; includeSubDomains',
        'x-content-type-options': 'nosniff',
        'x-dns-prefetch-control': 'off',
        'x-download-options': 'noopen',
        'x-frame-options': 'SAMEORIGIN',
        'x-xss-protection': '1; mode=block'
      })
    })
  })
}

function routeResponseHeaders (res) {
  const relevantHeaders = _.omit(res.headers, [
    'connection',
    'content-length',
    'content-type',
    'date',
    'etag'
  ])
  expect(relevantHeaders).to.deep.equal({
    'access-control-allow-origin': '*',
    'strict-transport-security': 'max-age=15552000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-dns-prefetch-control': 'off',
    'x-download-options': 'noopen',
    'x-frame-options': 'SAMEORIGIN',
    'x-xss-protection': '1; mode=block'
  })
}

module.exports = {
  describeOptionsRequest,
  routeResponseHeaders
}
