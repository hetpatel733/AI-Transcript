const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function authMiddleware(req, res, next){
  try{
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ','')
    if(!token) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const secret = process.env.JWT_SECRET
    if(!secret) return res.status(500).json({ success: false, message: 'Server misconfigured' })
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')
    if(!user) return res.status(401).json({ success: false, message: 'Unauthorized' })
    req.user = user
    next()
  }catch(err){
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}

module.exports = authMiddleware
