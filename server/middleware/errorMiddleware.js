function notFound(req, res, next){
  res.status(404).json({ success: false, message: 'Route not found' })
}

function errorHandler(err, req, res, next){
  console.error(err)
  const status = err.status || 500
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error')
  res.status(status).json({ success: false, message })
}

module.exports = { notFound, errorHandler }
