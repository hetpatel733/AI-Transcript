const mongoose = require('mongoose')

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  date: { type: Date },
  type: { type: String },
  participants: [{ type: String }],
  transcript: { type: String },
  summary: { type: String, default: '' },
  discussionPoints: [{ type: String }],
  decisions: [{ type: String }],
  risks: [{ type: String }],
  unansweredQuestions: [{ type: String }],
  aiProcessed: { type: Boolean, default: false },
  aiProcessedAt: { type: Date },
}, { timestamps: true })

meetingSchema.index({ user: 1, date: -1 })
meetingSchema.index({ user: 1, title: 'text' })

module.exports = mongoose.model('Meeting', meetingSchema)
