const Meeting = require('../models/Meeting')
const ActionItem = require('../models/ActionItem')
const { success, error } = require('../utils/apiResponse')

exports.getDashboard = async (req, res) => {
  try{
    const userId = req.user._id
    const totalMeetings = await Meeting.countDocuments({ user: userId })
    const totalActionItems = await ActionItem.countDocuments({ user: userId })
    const openActionItems = await ActionItem.countDocuments({ user: userId, status: 'Open' })
    const completedActionItems = await ActionItem.countDocuments({ user: userId, status: 'Completed' })
    const overdueActionItems = await ActionItem.countDocuments({ user: userId, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } })
    const recentMeetings = await Meeting.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
    return success(res, { stats: { totalMeetings, totalActionItems, openActionItems, completedActionItems, overdueActionItems }, recentMeetings })
  }catch(err){
    console.error(err)
    return error(res, 500, 'Could not load dashboard')
  }
}
