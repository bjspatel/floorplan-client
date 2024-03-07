const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Serialize = require('php-serialize')

const privateKey = fs.readFileSync(path.join(__dirname, 'insecure-testing-key.pem'))

module.exports = function (signable, signatureField) {
  const target = Object.keys(signable).sort()
    .reduce((accumulator, key) => {
      if (key === signatureField) {
        return accumulator
      }
      accumulator[key] = signable[key]
      return accumulator
    }, {})

  const serializedParams = Serialize.serialize(target)

  const sign = crypto.createSign('RSA-SHA1')
  sign.write(serializedParams)
  sign.end()

  const signature = sign.sign(privateKey, 'base64')

  return signature
}
