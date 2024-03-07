/**
 * @file
 * @description Tests non-existing route
 */
'use strict'

const request = require('supertest')
const { expect } = require('chai')
const { shared, commonAssertions } = require('../../test-util')

module.exports = () => {
  describe('Non-existing route', () => {
    const url = '/non-existing-route'
    const methods = ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']
    methods.forEach(method => {
      it(`responds with 404 Not Found on ${method} request for non-existing route`, async function () {
        const res = await request.agent(shared.app)[method.toLowerCase()](url)
        expect(res).to.not.equal(null)
        expect(res.status).to.equal(404)
        commonAssertions.routeResponseHeaders(res)

        expect(res.body).to.be.an('object')
        expect(res.body.error).to.equal(true)
        expect(res.body.name).to.equal('NotFoundError')
      })
    })
  })
}
