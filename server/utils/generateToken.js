const jwt = require('jsonwebtoken')

function generateToken(payload){
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'
  if(!secret) throw new Error('JWT_SECRET not configured')
  return jwt.sign(payload, secret, { expiresIn })
}

module.exports = generateToken
