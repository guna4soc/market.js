const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: String }, // Optional: user email or ID, null for system-wide
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // e.g., 'info', 'order', 'stock', etc.
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // Additional fields for frontend compatibility
  icon: { type: String, default: '🔔' },
  text: { type: String },
  time: { type: String }
});

module.exports = mongoose.model('Notification', notificationSchema); 