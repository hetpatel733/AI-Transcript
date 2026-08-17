const aiService = require('./aiService')
const Meeting = require('../models/Meeting')
const ActionItem = require('../models/ActionItem')

function isValidDate(d){
  return !isNaN(new Date(d).getTime())
}

function normalizeAnalysis(raw){
  const out = {
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    discussionPoints: Array.isArray(raw.discussionPoints) ? raw.discussionPoints : [],
    decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
    actionItems: Array.isArray(raw.actionItems) ? raw.actionItems : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    unansweredQuestions: Array.isArray(raw.unansweredQuestions) ? raw.unansweredQuestions : [],
    participants: Array.isArray(raw.participants) ? raw.participants.map(p=>String(p).trim()).filter(Boolean) : [],
    meetingDate: raw.meetingDate ? (new Date(raw.meetingDate)) : null
  }
  // normalize action items
  out.actionItems = out.actionItems.map(ai => {
    return {
      task: ai.task ? String(ai.task).trim() : null,
      owner: ai.owner ? String(ai.owner) : 'Unassigned',
      dueDate: ai.dueDate && isValidDate(ai.dueDate) ? new Date(ai.dueDate) : null,
      priority: ['Low','Medium','High'].includes(ai.priority) ? ai.priority : 'Medium'
    }
  }).filter(x=> x.task)
  return out
}

async function analyzeAndPersist(meeting){
  if(!meeting || !meeting.transcript) throw new Error('Transcript missing')
  const raw = await aiService.analyze(meeting.transcript)
  const parsed = normalizeAnalysis(raw)
  // validate parsed structure strictly before saving
  function validateParsed(p){
    if(typeof p.summary !== 'string') return false
    if(!Array.isArray(p.discussionPoints)) return false
    if(!Array.isArray(p.decisions)) return false
    if(!Array.isArray(p.risks)) return false
    if(!Array.isArray(p.unansweredQuestions)) return false
    if(!Array.isArray(p.actionItems)) return false
    // validate action items
    for(const ai of p.actionItems){
      if(!ai.task || typeof ai.task !== 'string') return false
      if(ai.owner && typeof ai.owner !== 'string') return false
      if(ai.priority && !['Low','Medium','High'].includes(ai.priority)) return false
      if(ai.dueDate && !(ai.dueDate instanceof Date)) return false
    }
      // participants optional array
      if(p.participants && !Array.isArray(p.participants)) return false
      if(p.meetingDate && !(p.meetingDate instanceof Date)) return false
    return true
  }

  if(!validateParsed(parsed)){
    throw new Error('Invalid AI analysis format')
  }

  // update meeting metadata if AI provided participants or meetingDate
  if(Array.isArray(parsed.participants) && parsed.participants.length>0){
    meeting.participants = parsed.participants
  }
  if(parsed.meetingDate instanceof Date && !isNaN(parsed.meetingDate.getTime())){
    meeting.date = parsed.meetingDate
  }

  // save analysis fields to meeting
  meeting.summary = parsed.summary
  meeting.discussionPoints = parsed.discussionPoints
  meeting.decisions = parsed.decisions
  meeting.risks = parsed.risks
  meeting.unansweredQuestions = parsed.unansweredQuestions
  meeting.aiProcessed = true
  meeting.aiProcessedAt = new Date()
  await meeting.save()
  // remove existing AI-generated actions for this meeting
  await ActionItem.deleteMany({ meeting: meeting._id, user: meeting.user, source: 'ai' })
  // create new AI action items
  const created = []
  for(const ai of parsed.actionItems){
    const item = await ActionItem.create({ meeting: meeting._id, user: meeting.user, task: ai.task, owner: ai.owner || 'Unassigned', dueDate: ai.dueDate || undefined, priority: ai.priority || 'Medium', status: 'Open', source: 'ai' })
    created.push(item)
  }
  return { analysis: parsed, created }
}

module.exports = { analyzeAndPersist }
