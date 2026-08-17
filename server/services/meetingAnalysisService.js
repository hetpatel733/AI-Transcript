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
    unansweredQuestions: Array.isArray(raw.unansweredQuestions) ? raw.unansweredQuestions : []
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
  // save to meeting
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
