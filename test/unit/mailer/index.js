/**
 * @file
 * @description Tests mailer functions
 */
'use strict'

const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { shared } = require('../../test-util')
const config = require('../../../config')
const mailer = require('../../../app/lib/mailer')
const ClientModel = require('../../../app/init/models/client')
const UserModel = require('../../../app/init/models/user')
const VerificationTokenModel = require('../../../app/init/models/verificationtoken')

const expect = chai.expect

chai.use(chaiAsPromised)

module.exports = () => {
  describe('Mailer', () => {
    const client = new ClientModel(shared.clientData1)
    const user = new UserModel(shared.userData1)

    beforeEach(function () {
      sinon.stub(mailer.sns, 'publish').returns({
        promise () {
          return Promise.resolve({})
        }
      })
    })

    afterEach(function () {
      mailer.sns.publish.restore()
    })

    describe('Login Mail', () => {
      const link = 'https://foobar.baz'
      const expDate = new Date()

      it('should fail on providing unexpected object as input', async function () {
        const promise = mailer.sendLoginMail({ id: 'foobar' }, link, expDate)
        return expect(promise).to.be.rejected
      })

      it('should send SNS message for client login mail', async function () {
        await mailer.sendLoginMail(client, link, expDate)
        const expectedParams = {
          Message: JSON.stringify({
            event: 'CLIENT_LOGIN',
            link,
            email: client.email,
            name: client.name,
            date: expDate.toISOString()
          }),
          TopicArn: config.AWS_SNS_TOPIC_COMMUNICATE_ARN
        }
        sinon.assert.calledOnce(mailer.sns.publish)
        sinon.assert.calledWith(mailer.sns.publish, expectedParams)
      })

      it('should send SNS message for user login mail', async function () {
        await mailer.sendLoginMail(user, link, expDate)
        const expectedParams = {
          Message: JSON.stringify({
            event: 'CLIENT_LOGIN',
            link,
            email: user.email,
            name: user.name,
            date: expDate.toISOString()
          }),
          TopicArn: config.AWS_SNS_TOPIC_COMMUNICATE_ARN
        }
        sinon.assert.calledOnce(mailer.sns.publish)
        sinon.assert.calledWith(mailer.sns.publish, expectedParams)
      })
    })

    describe('Signup Received Mail', () => {
      it('should fail on providing unexpected object as input', async function () {
        const promise = mailer.sendSignupReceivedMail({ id: 'foobar' })
        return expect(promise).to.be.rejected
      })

      it('should send SNS message for signup received email for the client', async function () {
        await mailer.sendSignupReceivedMail(client)
        const expectedParams = {
          Message: JSON.stringify({
            event: 'SIGNUP_RECEIVED',
            account: client.deployment.domain,
            email: client.email,
            name: client.name
          }),
          TopicArn: config.AWS_SNS_TOPIC_COMMUNICATE_ARN
        }
        sinon.assert.calledOnce(mailer.sns.publish)
        sinon.assert.calledWith(mailer.sns.publish, expectedParams)
      })
    })

    describe('Email Verification Mail', () => {
      const tokenValue = 'foobarbaz'
      const expDate = new Date()
      const token = new VerificationTokenModel({
        token: tokenValue,
        client_id: client.id,
        expiry_date: expDate
      })

      it('should fail on providing unexpected object as client argument', async function () {
        const promise = mailer.sendEmailVerificationMail({ id: 'foobar' }, token)
        return expect(promise).to.be.rejected
      })

      it('should fail on providing unexpected object as token argument', async function () {
        const promise = mailer.sendEmailVerificationMail(client, { expiryDate: new Date() })
        return expect(promise).to.be.rejected
      })

      it('should send SNS message for signup received email for the client', async function () {
        await mailer.sendEmailVerificationMail(client, token)
        const expectedParams = {
          Message: JSON.stringify({
            event: 'EMAIL_CONFIRM',
            link: config.EMAIL_VERIFICATION_URL_TEMPLATE.replace('%token%', 'foobarbaz'),
            email: client.email,
            name: client.name,
            date: expDate.toISOString()
          }),
          TopicArn: config.AWS_SNS_TOPIC_COMMUNICATE_ARN
        }
        sinon.assert.calledOnce(mailer.sns.publish)
        sinon.assert.calledWith(mailer.sns.publish, expectedParams)
      })
    })
  })
}
