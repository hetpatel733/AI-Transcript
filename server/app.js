const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const path = require('path')
const authRoutes = require('./routes/authRoutes')
const meetingRoutes = require('./routes/meetingRoutes')
const actionRoutes = require('./routes/actionRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

// In production the React app is served from the same origin, so we only need
// helmet for the API. Disable CSP so Vite's hashed asset filenames aren't blocked.
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_URL, credentials: true }))

// global rate limit
app.use('/api/', rateLimit({ windowMs: 60*1000, max: 200 }))

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }))

app.use('/api/auth', authRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/actions', actionRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Unknown /api/* routes → 404 JSON (must come before static serving)
app.use((req, res, next) => {
  if(req.path.startsWith('/api/')) return notFound(req, res, next)
  next()
})

// Serve built React frontend in production
if(process.env.NODE_ENV === 'production'){
  const staticPath = path.join(__dirname, 'public')
  app.use(express.static(staticPath))
  // All remaining routes return the React SPA shell
  app.get('*', (req, res) => res.sendFile(path.join(staticPath, 'index.html')))
} else {
  app.use(notFound)
}

app.use(errorHandler)

module.exports = app
