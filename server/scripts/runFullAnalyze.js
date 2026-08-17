require('dotenv').config()
const connectDB = require('../config/db')
const User = require('../models/User')
const Meeting = require('../models/Meeting')
const { analyzeAndPersist } = require('../services/meetingAnalysisService')

async function run(){
  let mongod
  try{
    mongod = await connectDB(process.env.MONGODB_URI)
    // find or create a user
    let user = await User.findOne()
    if(!user){
      user = await User.create({ name: 'Test User', email: `test+ai${Date.now()}@example.com`, password: 'password' })
      console.log('Created test user', user.email)
    }

    // find or create a meeting for this user
    let meeting = await Meeting.findOne({ user: user._id })
    if(!meeting){
      meeting = await Meeting.create({ user: user._id, title: 'Temp Analysis Meeting', date: new Date(), type: 'Sprint', participants: ['Alice','Bob'], transcript: `Alice: Let's ship v1 next week.\nBob: We need deployment docs.\nAlice: Mike will take docs.` })
      console.log('Created temp meeting', meeting._id)
    }

    // reload meeting as full mongoose document
    meeting = await Meeting.findById(meeting._id)

    console.log('Running analyzeAndPersist for meeting', meeting._id.toString())
    const result = await analyzeAndPersist(meeting)
    console.log('Analyze result:', JSON.stringify(result.analysis, null, 2))
    console.log('Created action items:', result.created.map(a=>({ id: a._id, task: a.task, owner: a.owner, dueDate: a.dueDate ? a.dueDate.toISOString().slice(0,10) : null })))

    // exit
    process.exit(0)
  }catch(err){
    console.error('Full analyze failed:', err)
    process.exit(1)
  }finally{
    if(mongod && typeof mongod.stop === 'function') await mongod.stop()
  }
}

run()
