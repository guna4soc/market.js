const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  label: { type: String, required: true },
  tag: String,
  color: String,
  desc: String
});

module.exports = mongoose.model('Category', categorySchema); 