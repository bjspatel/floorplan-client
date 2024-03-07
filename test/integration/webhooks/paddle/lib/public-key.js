const fs = require('fs')
const path = require('path')

const publicKey = fs.readFileSync(path.join(__dirname, 'insecure-testing-key.pub'), 'utf8')

module.exports = publicKey
