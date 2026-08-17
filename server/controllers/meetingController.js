const Meeting = require('../models/Meeting')
const ActionItem = require('../models/ActionItem')
const { success, error } = require('../utils/apiResponse')
const mongoose = require('mongoose')

exports.createMeeting = async (req, res) => {
  try{
    const { title, date, type, participants, transcript } = req.body
    if(!title) return error(res, 422, 'Meeting title cannot be empty')
    if(!date) return error(res, 422, 'Meeting date must be valid')
    if(!type) return error(res, 422, 'Meeting type must be selected')
    if(!participants || !Array.isArray(participants) || participants.length===0) return error(res, 422, 'Participants cannot be empty')
    if(!transcript) return error(res, 422, 'Transcript cannot be empty')
    const max = parseInt(process.env.MAX_TRANSCRIPT_LENGTH || '100000', 10)
    if(transcript.length > max) return error(res, 422, 'Transcript is too large.')
    const meeting = await Meeting.create({ user: req.user._id, title: title.trim(), date: new Date(date), type, participants, transcript })
    return success(res, { meeting })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not create meeting')
  }
}

exports.listMeetings = async (req, res) => {
  try{
    const { search } = req.query
    const filter = { user: req.user._id }
    if(search){
      filter.$text = { $search: search }
    }
    const meetings = await Meeting.find(filter).sort({ createdAt: -1 })
    return success(res, { meetings })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not load meetings')
  }
}

exports.getMeeting = async (req, res) => {
  try{
    const { meetingId } = req.params
    if(!mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    const actionItems = await ActionItem.find({ meeting: meetingId, user: req.user._id })
    const result = meeting.toObject()
    result.actionItems = actionItems
    return success(res, { meeting: result })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not load meeting')
  }
}

exports.updateMeeting = async (req, res) => {
  try{
    const { meetingId } = req.params
    if(!mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    const { title, date, type, participants, transcript } = req.body
    if(title) meeting.title = title.trim()
    if(date) meeting.date = new Date(date)
    if(type) meeting.type = type
    if(Array.isArray(participants)) meeting.participants = participants
    if(typeof transcript === 'string' && transcript !== meeting.transcript){
      const max = parseInt(process.env.MAX_TRANSCRIPT_LENGTH || '100000', 10)
      if(transcript.length > max) return error(res, 422, 'Transcript is too large.')
      meeting.transcript = transcript
      meeting.aiProcessed = false
      meeting.aiProcessedAt = undefined
      meeting.summary = ''
      meeting.discussionPoints = []
      meeting.decisions = []
      meeting.risks = []
      meeting.unansweredQuestions = []
    }
    await meeting.save()
    return success(res, { meeting })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not update meeting')
  }
}

exports.deleteMeeting = async (req, res) => {
  try{
    const { meetingId } = req.params
    if(!mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOneAndDelete({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    await ActionItem.deleteMany({ meeting: meetingId, user: req.user._id })
    return success(res, { message: 'Meeting deleted' })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not delete meeting')
  }
}
