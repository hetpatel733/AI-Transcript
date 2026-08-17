const express = require('express')
const router = express.Router()
const { body, param, query } = require('express-validator')
const validate = require('../middleware/validateMiddleware')
const auth = require('../middleware/authMiddleware')
const meetingController = require('../controllers/meetingController')
const aiController = require('../controllers/aiController')
const rateLimit = require('express-rate-limit')

const analyzeLimiter = rateLimit({ windowMs: 60*1000, max: 3 })

router.use(auth)

router.post('/', [
  body('title').notEmpty(),
  body('date').notEmpty(),
  body('type').notEmpty(),
  body('participants').isArray().withMessage('Participants must be an array'),
  body('transcript').notEmpty()
], validate, meetingController.createMeeting)

router.get('/', meetingController.listMeetings)

router.get('/:meetingId', [param('meetingId').notEmpty()], validate, meetingController.getMeeting)

router.put('/:meetingId', [param('meetingId').notEmpty()], validate, meetingController.updateMeeting)

router.delete('/:meetingId', meetingController.deleteMeeting)

router.post('/:meetingId/analyze', analyzeLimiter, aiController.analyzeMeeting)

module.exports = router
