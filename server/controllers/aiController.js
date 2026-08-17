const Meeting = require('../models/Meeting')
const { analyzeAndPersist } = require('../services/meetingAnalysisService')
const { success, error } = require('../utils/apiResponse')
const mongoose = require('mongoose')

exports.analyzeMeeting = async (req, res) => {
  try{
    const { meetingId } = req.params
    if(!mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    if(!meeting.transcript) return error(res, 400, 'Transcript missing')
    const result = await analyzeAndPersist(meeting)
    return success(res, { analysis: result.analysis })
  }catch(err){
    console.error('AI error', err)
    return error(res, 500, 'AI analysis could not be completed. Please try again.')
  }
}
