const ActionItem = require('../models/ActionItem')
const Meeting = require('../models/Meeting')
const mongoose = require('mongoose')
const { success, error } = require('../utils/apiResponse')

exports.listActions = async (req, res) => {
  try{
    const { status, priority, owner, search, dueDate } = req.query
    const filter = { user: req.user._id }
    if(status) filter.status = status
    if(priority) filter.priority = priority
    if(owner) filter.owner = owner
    if(search) filter.task = { $regex: search, $options: 'i' }
    if(dueDate) filter.dueDate = { $eq: new Date(dueDate) }
    // sort: overdue, nearest due date, newest
    const items = await ActionItem.find(filter).sort({ dueDate: 1, createdAt: -1 })
    return success(res, { actionItems: items })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not load action items')
  }
}

exports.createAction = async (req, res) => {
  try{
    const { meetingId, task, owner, dueDate, priority, status } = req.body
    if(!meetingId || !mongoose.Types.ObjectId.isValid(meetingId)) return error(res, 400, 'Invalid meeting id')
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user._id })
    if(!meeting) return error(res, 404, 'Meeting not found')
    if(!task) return error(res, 422, 'Task is required')
    const item = await ActionItem.create({ meeting: meetingId, user: req.user._id, task: task.trim(), owner: owner || 'Unassigned', dueDate: dueDate ? new Date(dueDate) : undefined, priority: priority || 'Medium', status: status || 'Open', source: 'manual' })
    return success(res, { action: item })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not create action item')
  }
}

exports.updateAction = async (req, res) => {
  try{
    const { actionId } = req.params
    if(!mongoose.Types.ObjectId.isValid(actionId)) return error(res, 400, 'Invalid action id')
    const action = await ActionItem.findOne({ _id: actionId, user: req.user._id })
    if(!action) return error(res, 404, 'Action not found')
    const allowed = ['task','owner','dueDate','priority','status']
    for(const key of allowed){
      if(req.body[key] !== undefined){
        action[key] = key === 'dueDate' ? (req.body[key] ? new Date(req.body[key]) : undefined) : req.body[key]
      }
    }
    await action.save()
    return success(res, { action })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not update action')
  }
}

exports.deleteAction = async (req, res) => {
  try{
    const { actionId } = req.params
    if(!mongoose.Types.ObjectId.isValid(actionId)) return error(res, 400, 'Invalid action id')
    const action = await ActionItem.findOneAndDelete({ _id: actionId, user: req.user._id })
    if(!action) return error(res, 404, 'Action not found')
    return success(res, { message: 'Action item deleted' })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not delete action')
  }
}
