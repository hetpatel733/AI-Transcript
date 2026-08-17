const axios = require('axios')
const DEFAULT_MODEL = 'gemini-3.1-flash-lite'

const SYSTEM_PROMPT = `You are an assistant that extracts a strict, structured meeting analysis from the provided transcript. Respond with JSON only and nothing else (no markdown, no code fences, no explanation). Do NOT invent people, owners, deadlines, decisions, risks, or any facts not present in the transcript. If information is not provided, use empty arrays, "Unassigned" for unspecified action owners, null for unspecified dueDate, and "Medium" for unspecified priority. Use the exact JSON schema: {"summary":"string","discussionPoints":["string"],"decisions":["string"],"actionItems":[{"task":"string","owner":"string","dueDate":"YYYY-MM-DD or null","priority":"Low|Medium|High"}],"risks":["string"],"unansweredQuestions":["string"]}. Return valid JSON only.`

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

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: `Transcript:\n${transcript}` }] }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 2048 }
  }

  let resp
  try{
    resp = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    })
  }catch(err){
    const status = err.response?.status
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message
    console.error(`Gemini request failed: status=${status} body=${detail}`)
    if(process.env.AI_FALLBACK_TO_MOCK !== 'false'){
      console.warn('Falling back to mock analysis due to Gemini failure')
      return analyzeWithMock(transcript)
    }
    throw new Error('AI provider request failed')
  }

  // Response shape: { candidates: [{ content: { parts: [{ text }] } }] }
  const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null

  if(!text){
    console.error('Gemini empty text in response:', JSON.stringify(resp.data).slice(0, 300))
    if(process.env.AI_FALLBACK_TO_MOCK !== 'false') return analyzeWithMock(transcript)
    throw new Error('Empty response from Gemini')
  }

  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if(!jsonMatch) throw new Error('Could not parse JSON from Gemini response')

  return sanitizeAIResponse(JSON.parse(jsonMatch[0]))
}

function sanitizeAIResponse(obj){
  function safeString(v, max=2000){
    if(!v && v !== 0) return ''
    const s = String(v).replace(/\s+/g,' ').trim()
    return s.length > max ? s.slice(0, max) : s
  }

  function safeArray(arr, maxItems=100, maxLen=1000){
    if(!Array.isArray(arr)) return []
    const out = []
    for(const item of arr){
      if(item === null || item === undefined) continue
      const s = safeString(item, maxLen)
      if(s) out.push(s)
      if(out.length >= maxItems) break
    }
    // de-dup while preserving order
    return out.filter((v, i) => out.indexOf(v) === i)
  }

  function parseActionItems(arr){
    if(!Array.isArray(arr)) return []
    const out = []
    for(const ai of arr){
      if(!ai) continue
      const task = safeString(ai.task || ai.text || ai.description || '')
      if(!task) continue
      const owner = safeString(ai.owner || ai.assignee || 'Unassigned', 200)
      // normalize priority
      const priorityRaw = String(ai.priority || ai.priority_level || ai.level || 'Medium')
      const priority = ['Low','Medium','High'].includes(priorityRaw) ? priorityRaw : (['low','medium','high'].includes(priorityRaw.toLowerCase()) ? priorityRaw[0].toUpperCase()+priorityRaw.slice(1).toLowerCase() : 'Medium')
      // try to parse a date-like string; we'll return ISO date (YYYY-MM-DD) or null
      let dueDate = null
      const candidateDate = ai.dueDate || ai.due_date || ai.due || ai.due_at || null
      if(candidateDate){
        const d = new Date(candidateDate)
        if(!isNaN(d.getTime())){
          // format as YYYY-MM-DD
          dueDate = d.toISOString().slice(0,10)
        }
      }
      out.push({ task, owner, dueDate, priority })
      if(out.length >= 200) break
    }
    // de-dup by task
    const seen = new Set()
    return out.filter(ai => {
      if(seen.has(ai.task)) return false
      seen.add(ai.task)
      return true
    })
  }

  return {
    summary: safeString(obj.summary || '' , 4000),
    discussionPoints: safeArray(obj.discussionPoints, 200, 1000),
    decisions: safeArray(obj.decisions, 200, 1000),
    actionItems: parseActionItems(obj.actionItems),
    risks: safeArray(obj.risks, 200, 1000),
    unansweredQuestions: safeArray(obj.unansweredQuestions, 200, 1000)
  }
}

async function analyze(transcript){
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase()
  if(provider === 'gemini') return analyzeWithGemini(transcript)
  if(provider === 'mock') return analyzeWithMock(transcript)
  console.warn('Unknown AI_PROVIDER', provider, '— falling back to mock')
  return analyzeWithMock(transcript)
}

module.exports = { analyze }
