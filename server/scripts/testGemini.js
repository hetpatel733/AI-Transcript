require('dotenv').config()
const aiService = require('../services/aiService')

async function run(){
  try{
    const sample = `Alice: Let's ship v1 next week.\nBob: We need deployment docs.\nAlice: Mike will take docs.`
    console.log('Calling AI...')
    const out = await aiService.analyze(sample)
    console.log('AI result:', JSON.stringify(out, null, 2))
  }catch(err){
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()
