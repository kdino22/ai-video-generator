const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  videoUrl: String,
  status: { type: String, default: 'processing' }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);