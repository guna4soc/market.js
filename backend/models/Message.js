const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // recipient email
  from: { type: String, required: true }, // sender (e.g., 'Admin', 'Support', or another user)
  subject: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
  important: { type: Boolean, default: false },
  archived: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema); 