/**
 * @file
 * @description Tests notifier functions
 */
'use strict'

const sinon = require('sinon')
const notifier = require('../../../app/lib/notifier')
const config = require('../../../config')

const SUBJECT_PREFIX = '[Deskradar Clients API]'

module.exports = () => {
  describe('Notifier', () => {
    beforeEach(function () {
      sinon.stub(notifier.sns, 'publish').returns({
        promise () {
          return Promise.resolve({})
        }
      })
    })

    afterEach(function () {
      notifier.sns.publish.restore()
    })

    it('should send login notification', async function () {
      await notifier.sendLoginNotification('user', 'foobar')
      const expectedParams = {
        Message: JSON.stringify({
          env: 'test',
          event: 'login',
          user_type: 'user',
          user_id: 'foobar'
        }),
        Subject: `${SUBJECT_PREFIX} Login`,
        TopicArn: config.AWS_SNS_TOPIC_UPDATES_ARN
      }
      sinon.assert.calledOnce(notifier.sns.publish)
      sinon.assert.calledWith(notifier.sns.publish, expectedParams)
    })

    it('should send client signup notification', async function () {
      await notifier.sendClientSignupNotification('foobar')
      const expectedParams = {
        Message: JSON.stringify({
          env: 'test',
          event: 'signup',
          client_id: 'foobar'
        }),
        Subject: `${SUBJECT_PREFIX} Client signup`,
        TopicArn: config.AWS_SNS_TOPIC_UPDATES_ARN
      }
      sinon.assert.calledOnce(notifier.sns.publish)
      sinon.assert.calledWith(notifier.sns.publish, expectedParams)
    })

    it('should send client email confirmed notification', async function () {
      await notifier.sendClientEmailConfirmedNotification('foobar')
      const expectedParams = {
        Message: JSON.stringify({
          env: 'test',
          event: 'email_confirmed',
          client_id: 'foobar'
        }),
        Subject: `${SUBJECT_PREFIX} Client email confirmed`,
        TopicArn: config.AWS_SNS_TOPIC_UPDATES_ARN
      }
      sinon.assert.calledOnce(notifier.sns.publish)
      sinon.assert.calledWith(notifier.sns.publish, expectedParams)
    })
  })
}
