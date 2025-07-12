const mongoose = require('mongoose');
const helpRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
});
module.exports = mongoose.model('HelpRequest', helpRequestSchema); 