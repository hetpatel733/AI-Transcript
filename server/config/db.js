const mongoose = require('mongoose')

const connectDB = async (uri) => {
  if(!uri) throw new Error('MONGODB_URI not provided')
  try{
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
  }catch(err){
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
