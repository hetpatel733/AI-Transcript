require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

async function start(){
  if(!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }
  if(!process.env.JWT_SECRET){
    console.error('JWT_SECRET is required')
    process.exit(1)
  }
  await connectDB(process.env.MONGODB_URI)
  app.listen(PORT)
}

start().catch(err => {
  console.error('Failed to start', err)
  process.exit(1)
})
