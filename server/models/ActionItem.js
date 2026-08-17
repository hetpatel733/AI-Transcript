const mongoose = require('mongoose')

const actionSchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  task: { type: String, required: true, trim: true },
  owner: { type: String, default: 'Unassigned' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  status: { type: String, enum: ['Open','In Progress','Blocked','Completed'], default: 'Open' },
  source: { type: String, enum: ['ai','manual'], default: 'manual' }
}, { timestamps: true })

actionSchema.index({ user: 1, status: 1 })
actionSchema.index({ user: 1, priority: 1 })
actionSchema.index({ user: 1, dueDate: 1 })

module.exports = mongoose.model('ActionItem', actionSchema)
