/**
 * Simple AI service wrapper.
 * Supports provider "mock" returning deterministic structured JSON.
 * Real provider integration point exists but is not implemented.
 */

const axios = require('axios')
const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase()
const DEFAULT_MODEL = 'gemini-2.5-flash'

async function analyzeWithMock(transcript){
  const summary = transcript.split('\n').slice(0,3).join(' ').slice(0,500)
  return {
    summary: summary || 'No summary available',
    discussionPoints: [],
    decisions: [],
    actionItems: [],
    risks: [],
    unansweredQuestions: []
  }
}

async function analyzeWithGemini(transcript){
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || DEFAULT_MODEL

  if(!apiKey) throw new Error('AI_API_KEY is required for gemini provider')

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  const systemPrompt = `You are an assistant that extracts a strict, structured meeting analysis from the provided transcript. Respond with JSON only and nothing else (no markdown, no explanation). Do NOT invent people, owners, deadlines, decisions, risks, or any facts not present in the transcript. If information is not provided, use empty arrays, "Unassigned" for unspecified action owners, null for unspecified dueDate, and "Medium" for unspecified priority. Use the exact JSON schema: {"summary":"string","discussionPoints":["string"],"decisions":["string"],"actionItems":[{"task":"string","owner":"string","dueDate":"YYYY-MM-DD or null","priority":"Low|Medium|High"}],"risks":["string"],"unansweredQuestions":["string"]}. Return valid JSON only.`

  const prompt = `${systemPrompt}\n\nTranscript:\n${transcript}`

  try{
    const resp = await axios.post(endpoint, {
      prompt: { text: prompt },
      temperature: 0.0,
      maxOutputTokens: 800
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    })

    const data = resp.data

    // Heuristic extraction
    let text = null
    if(data && typeof data === 'object'){
      if(Array.isArray(data.candidates) && data.candidates[0]){
        const cand = data.candidates[0]
        text = cand.output?.[0]?.content?.[0]?.text || (cand.content && cand.content[0] && cand.content[0].text) || cand.text || null
      }
      if(!text && data.output){
        text = typeof data.output === 'string' ? data.output : JSON.stringify(data.output)
      }
      if(!text && data.result) text = data.result
    }
    if(!text && typeof data === 'string') text = data

    if(!text){
      if(typeof data === 'object') return sanitizeAIResponse(data)
      throw new Error('Empty response from Gemini')
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if(jsonMatch){
      const parsed = JSON.parse(jsonMatch[0])
      return sanitizeAIResponse(parsed)
    }

    try{
      const parsed = JSON.parse(text)
      return sanitizeAIResponse(parsed)
    }catch(err){
      throw new Error('Could not parse JSON from Gemini response')
    }
  }catch(err){
    console.error('Gemini provider error:', err.message)
    throw new Error('AI provider request failed')
  }
}

function sanitizeAIResponse(obj){
  return {
    summary: obj.summary || obj.summaryText || '',
    discussionPoints: obj.discussionPoints || obj.discussion_points || [],
    decisions: obj.decisions || [],
    // Normalize possible action item shapes to { task, owner, dueDate, priority }
    actionItems: (obj.actionItems || obj.action_items || []).map(ai => {
      if(!ai) return null
      return {
        task: ai.task || ai.text || ai.description || ai.title || null,
        owner: ai.owner || ai.assignee || ai.assignedTo || ai.person || 'Unassigned',
        dueDate: ai.dueDate || ai.due_date || ai.due || null,
        priority: ai.priority || ai.priority_level || ai.level || 'Medium'
      }
    }).filter(x=> x && x.task),
    risks: obj.risks || [],
    unansweredQuestions: obj.unansweredQuestions || obj.unanswered_questions || []
  }
}

async function analyze(transcript){
  if(provider === 'mock') return analyzeWithMock(transcript)
  if(provider === 'gemini') return analyzeWithGemini(transcript)
  // Unknown provider: fall back to mock to avoid crashes in dev
  console.warn('Unknown AI_PROVIDER', provider, 'falling back to mock')
  return analyzeWithMock(transcript)
}

module.exports = { analyze }
