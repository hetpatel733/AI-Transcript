require('dotenv').config()
const axios = require('axios')

async function run(){
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'gemini-2.5-flash'
  if(!apiKey) return console.error('AI_API_KEY missing')
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateMessage?key=${encodeURIComponent(apiKey)}`
  const system = `You are an assistant that extracts a strict, structured meeting analysis. Return JSON only.`
  const transcript = `Alice: Let's ship v1 next week.\nBob: We need deployment docs.\nAlice: Mike will take docs.`
  try{
    const body = {
      messages: [
        { author: 'system', content: [{ type: 'text', text: system }] },
        { author: 'user', content: [{ type: 'text', text: transcript }] }
      ],
      temperature: 0.0,
      candidateCount: 1,
      maxOutputTokens: 800
    }
    const res = await axios.post(endpoint, body, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 })
    console.log('status', res.status)
    console.log('data', JSON.stringify(res.data, null, 2))
  }catch(err){
    if(err.response) console.error('err', err.response.status, JSON.stringify(err.response.data))
    else console.error('err', err.message)
  }
}

run()
