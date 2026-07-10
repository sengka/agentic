const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    title: String,
    summary: String,
    link: String,
    source: String,
    embedding: [Number],
    publishedAt: Date
  }],
dailySummary: {
    type: String
  },
  feedback: {
    type: String,
    enum: ['like', 'dislike', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);