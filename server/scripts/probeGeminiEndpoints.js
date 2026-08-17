require('dotenv').config()
const axios = require('axios')

const apiKey = process.env.AI_API_KEY
const model = process.env.AI_MODEL || 'gemini-2.5-flash'
if(!apiKey){
  console.error('AI_API_KEY missing in env')
  process.exit(1)
}

const endpoints = [
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateText`,
  `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(model)}:generateText`,
  // legacy generateContent removed; probe message/generate endpoints and interaction-style endpoints
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateText`,
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateMessage`,
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateMessage`,
  `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(model)}:generateMessage`,
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generate`,
]

const bodies = [
  { prompt: { text: 'Extract JSON from: Alice: send docs' } },
  { input: { text: 'Extract JSON from: Alice: send docs' } },
  { messages: [ { author: 'system', content: [{ type: 'text', text: 'You are a JSON-only assistant.' }] }, { author: 'user', content: [{ type: 'text', text: 'Alice: send docs' }] } ] },
  { instances: [ { content: [ { type: 'text', text: 'Alice: send docs' } ] } ] },
]

;(async ()=>{
  for(const ep of endpoints){
    for(const body of bodies){
      try{
        console.log('\n--- Trying', ep)
        console.log('Body keys:', Object.keys(body))
        const url = ep + '?key=' + encodeURIComponent(apiKey)
        const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 })
        console.log('SUCCESS', res.status, JSON.stringify(res.data).slice(0,1000))
        return
      }catch(err){
        if(err.response){
          console.error('ERR', err.response.status, JSON.stringify(err.response.data).slice(0,1000))
        }else{
          console.error('ERR', err.message)
        }
      }
    }
  }
  console.log('No successful endpoint/payload combination found')
})()
