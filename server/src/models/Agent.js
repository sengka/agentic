const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  topics: [{
    type: String
  }],
  sources: [{
    type: String
  }],
  schedule: {
    type: String,
    default: 'daily'
  },
  scheduledHour: {
    type: Number,
    default: 7,
    min: 0,
    max: 23
  },
  language: {
    type: String,
    default: 'tr'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


module.exports = mongoose.model('Agent', agentSchema);