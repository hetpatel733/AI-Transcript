const Meeting = require('../models/Meeting')
const { analyzeAndPersist } = require('../services/meetingAnalysisService')
const { success, error } = require('../utils/apiResponse')
const mongoose = require('mongoose')
const ActionItem = require('../models/ActionItem')

exports.analyzeMeeting = async (req, res) => {
  try{
    const { meetingId } = req.params
    if(!mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    if(!meeting.transcript) return error(res, 400, 'Transcript missing')

    const maxLen = parseInt(process.env.MAX_TRANSCRIPT_LENGTH, 10) || 100000
    if(meeting.transcript.length > maxLen) return error(res, 400, 'Transcript too large for analysis')

    // Protect free quota: if already processed, do not call Gemini again unless forced
    const force = req.query.force === 'true' || req.query.regenerate === 'true'
    if(meeting.aiProcessed && !force){
      // return existing analysis and AI-generated actions
      const actions = await ActionItem.find({ meeting: meeting._id, source: 'ai' })
      return success(res, { meeting: {
        id: meeting._id,
        summary: meeting.summary,
        discussionPoints: meeting.discussionPoints,
        decisions: meeting.decisions,
        risks: meeting.risks,
        unansweredQuestions: meeting.unansweredQuestions,
        aiProcessed: meeting.aiProcessed,
        aiProcessedAt: meeting.aiProcessedAt
      }, actionItems: actions })
    }

    const result = await analyzeAndPersist(meeting)
    return success(res, { analysis: result.analysis, actionItems: result.created })
  }catch(err){
    console.error('AI error', err)
    return error(res, 500, 'AI analysis could not be completed. Please try again.')
  }
}
