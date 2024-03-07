'use strict'

module.exports = {
  CustomError: require('./custom-error'),
  ForbiddenError: require('./forbidden-error'),
  InternalError: require('./internal-error'),
  NotFoundError: require('./not-found-error'),
  TooManyRequestsError: require('./too-many-requests-error'),
  UnauthorizedError: require('./unauthorized-error'),
  ValidationError: require('./validation-error')
}
