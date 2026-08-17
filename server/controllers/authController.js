const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const { success, error } = require('../utils/apiResponse')

exports.register = async (req, res) => {
  try{
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if(existing) return error(res, 409, 'Email already in use')
    const user = await User.create({ name, email, password })
    const token = generateToken({ id: user._id })
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
    return success(res, { message: 'Registration successful', user: { id: user._id, name: user.name, email: user.email } })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Registration failed')
  }
}

exports.login = async (req, res) => {
  try{
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if(!user) return error(res, 401, 'Invalid email or password')
    const match = await user.comparePassword(password)
    if(!match) return error(res, 401, 'Invalid email or password')
    const token = generateToken({ id: user._id })
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
    return success(res, { user: { id: user._id, name: user.name, email: user.email } })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Login failed')
  }
}

exports.logout = async (req, res) => {
  res.clearCookie('token')
  return success(res, { message: 'Logged out successfully' })
}

exports.me = async (req, res) => {
  return success(res, { user: { id: req.user._id, name: req.user.name, email: req.user.email } })
}
