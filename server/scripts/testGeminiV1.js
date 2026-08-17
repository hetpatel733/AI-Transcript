require('dotenv').config()
const axios = require('axios')

async function run(){
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'gemini-2.5-flash'
  if(!apiKey) return console.error('AI_API_KEY missing')
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateText?key=${encodeURIComponent(apiKey)}`
  const prompt = `Extract a structured JSON from the transcript: Alice: ship next week. Bob: docs.`
  try{
    const body = { prompt: { text: prompt }, temperature: 0.0, maxOutputTokens: 800 }
    const res = await axios.post(endpoint, body, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 })
    console.log('status', res.status)
    console.log('data', JSON.stringify(res.data, null, 2))
  }catch(err){
    if(err.response) console.error('err', err.response.status, JSON.stringify(err.response.data))
    else console.error('err', err.message)
  }
}

run()
