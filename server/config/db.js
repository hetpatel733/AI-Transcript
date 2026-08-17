const mongoose = require('mongoose')

async function startInMemoryMongo(){
  try{
    const { MongoMemoryServer } = require('mongodb-memory-server')
    const mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)
    return mongod
  }catch(err){
    console.error('Failed to start in-memory MongoDB', err)
    throw err
  }
}

const connectDB = async (uri) => {
  // If the caller provided a URI (e.g. Atlas), attempt to connect and
  // fail fast on error so we don't silently fall back to an in-memory DB.
  if (uri) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('Database connected')
      return null
    } catch (err) {
      console.error('MongoDB connection error:', err.message)
      // When a user supplied a URI, don't auto-fallback — surface the error.
      throw err
    }
  }

  // No URI provided — allow a development fallback to an in-memory server.
  if (process.env.NODE_ENV !== 'production') {
    console.warn('MONGODB_URI not provided — starting in-memory MongoDB for development')
    const mongod = await startInMemoryMongo()
    return mongod
  }

  throw new Error('MONGODB_URI not provided')
}

module.exports = connectDB
