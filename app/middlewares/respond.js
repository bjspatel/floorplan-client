/**
 * @file
 * @description Middleware to filter the data on the basis of the given map
 */
'use strict'

const _ = require('lodash')
const { InternalError } = require('../lib/errors')

module.exports = responseMap => {
  return (req, res, next) => {
    if (Object.keys(responseMap.map).length > 0 && !res.data) {
      const error = new InternalError({ message: 'Response not generated' })
      return next(error)
    }

    const transform = (srcItem, map) => {
      const resItem = {}
      for (let resKey in map) {
        const srcKey = map[resKey]
        if (typeof srcKey === 'object') {
          const subData = srcItem[srcKey.field]
          const subMap = srcKey.map
          resItem[resKey] = transform(subData, subMap)
          continue
        }
        resItem[resKey] = srcItem[srcKey]
      }
      return resItem
    }

    let resData = Array.isArray(res.data)
      ? _.map(res.data, item => transform(item, responseMap.map))
      : transform(res.data, responseMap.map)

    res.status(responseMap.status).json(resData)
  }
}
