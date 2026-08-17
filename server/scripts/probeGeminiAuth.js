require('dotenv').config()
const axios = require('axios')

const apiKey = process.env.AI_API_KEY
const model = process.env.AI_MODEL || 'gemini-2.5-flash'
if(!apiKey){
  console.error('AI_API_KEY missing')
  process.exit(1)
}

const endpoints = [
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateMessage`,
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateMessage`,
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateText`,
]

const body = { messages: [ { author: 'system', content: [{ type: 'text', text: 'You are a JSON-only assistant.' }] }, { author: 'user', content: [{ type: 'text', text: 'Alice: send docs' }] } ] }

;(async ()=>{
  for(const ep of endpoints){
    try{
      console.log('\n--- TRY ?key at', ep)
      const res1 = await axios.post(ep + '?key=' + encodeURIComponent(apiKey), body, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 })
      console.log('?key success', res1.status, JSON.stringify(res1.data).slice(0,1000))
    }catch(err){
      console.error('?key err', err.response ? err.response.status : err.message, err.response ? JSON.stringify(err.response.data).slice(0,500) : '')
    }

    try{
      console.log('\n--- TRY Bearer at', ep)
      const res2 = await axios.post(ep, body, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, timeout: 20000 })
      console.log('Bearer success', res2.status, JSON.stringify(res2.data).slice(0,1000))
    }catch(err){
      console.error('Bearer err', err.response ? err.response.status : err.message, err.response ? JSON.stringify(err.response.data).slice(0,500) : '')
    }
  }
  console.log('done')
})()
