const express = require('express')
const router = express.Router()
const { body, param } = require('express-validator')
const validate = require('../middleware/validateMiddleware')
const auth = require('../middleware/authMiddleware')
const actionController = require('../controllers/actionController')

router.use(auth)

router.get('/', actionController.listActions)

router.post('/', [
  body('meetingId').notEmpty(),
  body('task').notEmpty()
], validate, actionController.createAction)

router.put('/:actionId', [param('actionId').notEmpty()], validate, actionController.updateAction)

router.delete('/:actionId', actionController.deleteAction)

module.exports = router
