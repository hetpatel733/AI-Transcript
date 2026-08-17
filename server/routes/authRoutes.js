const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const validate = require('../middleware/validateMiddleware')
const authController = require('../controllers/authController')
const auth = require('../middleware/authMiddleware')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({ windowMs: 60*1000, max: 10 })

router.post('/register', authLimiter, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validate, authController.register)

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, authController.login)

router.post('/logout', authController.logout)

router.get('/me', auth, authController.me)

module.exports = router
