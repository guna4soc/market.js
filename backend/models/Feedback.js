const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: String, required: true }, // user's email or name
  feedback: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' },
  date: { type: Date, default: Date.now },
  starred: { type: Boolean, default: false }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 