const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  user: { type: String, required: true }, // user email or id
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'Product' or 'Category'
  description: { type: String },
});

module.exports = mongoose.model('Favourite', favouriteSchema); 