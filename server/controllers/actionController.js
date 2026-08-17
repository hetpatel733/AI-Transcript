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
    const normalized = items.map(it => ({ id: it._id, meetingId: it.meeting, task: it.task, owner: it.owner, dueDate: it.dueDate ? it.dueDate.toISOString().slice(0,10) : null, priority: it.priority, status: it.status }))
    return success(res, { actionItems: normalized })
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
    const defaultOwner = owner || req.user?.name || 'Unassigned'
    const item = await ActionItem.create({ meeting: meetingId, user: req.user._id, task: task.trim(), owner: defaultOwner, dueDate: dueDate ? new Date(dueDate) : undefined, priority: priority || 'Medium', status: status || 'Open', source: 'manual' })
    const out = { id: item._id, meetingId: item.meeting, task: item.task, owner: item.owner, dueDate: item.dueDate ? item.dueDate.toISOString().slice(0,10) : null, priority: item.priority, status: item.status }
    return success(res, { action: out })
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
    const out = { id: action._id, meetingId: action.meeting, task: action.task, owner: action.owner, dueDate: action.dueDate ? action.dueDate.toISOString().slice(0,10) : null, priority: action.priority, status: action.status }
    return success(res, { action: out })
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
