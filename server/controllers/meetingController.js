const Meeting = require('../models/Meeting')
const ActionItem = require('../models/ActionItem')
const { success, error } = require('../utils/apiResponse')
const mongoose = require('mongoose')
const { extractTextFromBuffer } = require('../utils/fileExtractor')

exports.createMeeting = async (req, res) => {
  try{
    const { title, date, type, participants } = req.body
    let transcript = req.body.transcript

    // If a file was uploaded, extract text server-side
    if(req.file){
      try{
        transcript = await extractTextFromBuffer(req.file.originalname, req.file.buffer)
      }catch(err){
        return error(res, 422, 'Could not extract transcript from uploaded file')
      }
    }
    if(!title) return error(res, 422, 'Meeting title cannot be empty')
    // normalize participants if provided
    let parsedParticipants = participants
    if(typeof participants === 'string' && participants.trim()){
      try{ parsedParticipants = JSON.parse(participants) }catch(e){ parsedParticipants = participants.split(',').map(s=>s.trim()).filter(Boolean) }
    }
    // If transcript is present, try to extract metadata (participants, date, type) heuristically
    const max = parseInt(process.env.MAX_TRANSCRIPT_LENGTH || '100000', 10)
    if(transcript && transcript.length > max) return error(res, 422, 'Transcript is too large.')

    // helper extractors
    const extractParticipantsFromTranscript = (txt) => {
      if(!txt) return []
      const lines = txt.split('\n')
      for(const line of lines){
        const m = line.match(/^(Participants|Attendees|Present)[:\-]\s*(.+)$/i)
        if(m) return m[2].split(/,|;|\band\b/).map(s=>s.trim()).filter(Boolean)
      }
      return []
    }
    const extractDateFromTranscript = (txt) => {
      if(!txt) return null
      // look for ISO-like or common date patterns
      const iso = txt.match(/(\d{4}-\d{2}-\d{2})/)
      if(iso) return new Date(iso[1])
      const md = txt.match(/(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/)
      if(md) return new Date(md[1])
      const onDate = txt.match(/\bon\s+([A-Z][a-z]+\s+\d{1,2}(?:,\s*\d{4})?)/)
      if(onDate) return new Date(onDate[1])
      return null
    }
    const extractTypeFromTranscript = (txt) => {
      if(!txt) return null
      const m = txt.match(/^(Meeting Type|Type|Meeting:)[:\-]\s*(.+)$/im)
      if(m) return m[2].trim()
      // keyword based
      const lower = txt.toLowerCase()
      if(/retrospective|retro/.test(lower)) return 'Retrospective'
      if(/client/.test(lower)) return 'Client Meeting'
      if(/sales/.test(lower)) return 'Sales Meeting'
      if(/project/.test(lower)) return 'Project Meeting'
      if(/internal/.test(lower)) return 'Internal Meeting'
      return null
    }

    // attempt extraction only when transcript exists
    if(transcript){
      if(!parsedParticipants || (Array.isArray(parsedParticipants) && parsedParticipants.length===0)){
        const p = extractParticipantsFromTranscript(transcript)
        if(p && p.length>0) parsedParticipants = p
      }
      if(!date){
        const d = extractDateFromTranscript(transcript)
        if(d && !isNaN(d.getTime())) date = d.toISOString()
      }
      if(!type){
        const t = extractTypeFromTranscript(transcript)
        if(t) type = t
      }
    }

    const createObj = { user: req.user._id, title: title.trim() }
    if(date) createObj.date = new Date(date)
    if(type) createObj.type = type
    if(Array.isArray(parsedParticipants) && parsedParticipants.length>0) createObj.participants = parsedParticipants
    if(transcript) createObj.transcript = transcript

    let meeting = await Meeting.create(createObj)
    meeting = meeting.toObject()
    meeting.id = meeting._id

    // Optionally run AI analysis automatically for mock provider only
    try{
      const aiProvider = (process.env.AI_PROVIDER || 'mock').toLowerCase()
      if(aiProvider === 'mock'){
        // run in background, do not block response
        const { analyzeAndPersist } = require('../services/meetingAnalysisService')
        // pass a fresh Meeting model instance by re-querying
        ;(async ()=>{
          try{
            const m = await Meeting.findById(meeting.id)
            if(m && m.transcript) await analyzeAndPersist(m)
          }catch(e){
            console.error('Background AI analysis failed', e.message)
          }
        })()
      }
    }catch(e){ console.error('Auto-analyze setup failed', e.message) }

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
    const meetingsDocs = await Meeting.find(filter).sort({ createdAt: -1 })
    const meetings = meetingsDocs.map(m => {
      const obj = m.toObject()
      obj.id = obj._id
      return obj
    })
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
    const meetingDoc = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meetingDoc) return error(res, 404, 'Meeting not found')
    const actionItemsDocs = await ActionItem.find({ meeting: meetingId, user: req.user._id })
    const actionItems = actionItemsDocs.map(a => {
      const obj = a.toObject()
      obj.id = obj._id
      return obj
    })
    const result = meetingDoc.toObject()
    result.id = result._id
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
    const { title, date, type, participants } = req.body
    let transcript = req.body.transcript
    if(req.file){
      try{
        transcript = await extractTextFromBuffer(req.file.originalname, req.file.buffer)
      }catch(err){
        return error(res, 422, 'Could not extract transcript from uploaded file')
      }
    }
    if(title) meeting.title = title.trim()
    if(date) meeting.date = new Date(date)
    if(type) meeting.type = type
    if(Array.isArray(participants)) meeting.participants = participants
    else if(typeof participants === 'string'){
      try{ meeting.participants = JSON.parse(participants) }catch(e){ meeting.participants = participants.split(',').map(s=>s.trim()).filter(Boolean) }
    }
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
    const out = meeting.toObject()
    out.id = out._id
    return success(res, { meeting: out })
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
