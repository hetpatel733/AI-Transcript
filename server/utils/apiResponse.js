function success(res, data){
  return res.json({ success: true, ...data })
}

function error(res, status=400, message='Something went wrong'){
  return res.status(status).json({ success: false, message })
}

module.exports = { success, error }
