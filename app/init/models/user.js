/**
 * @file
 * @description User model definition
 */

'use strict'

const mongoose = require('mongoose')
const { ValidationError } = require('../../lib/errors')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin']
  }
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

userSchema._middlewares = {}

userSchema._middlewares.ensureUniquensess = async function (next) {
  const UserModel = mongoose.model('user')
  const user = await UserModel.findOne({
    _id: { $ne: this.id },
    email: this.email
  })

  if (user === null) {
    return next()
  }

  const error = new ValidationError({ message: 'user with this email already exists' })
  next(error)
}

userSchema.pre('save', userSchema._middlewares.ensureUniquensess)

module.exports = mongoose.model('user', userSchema)
