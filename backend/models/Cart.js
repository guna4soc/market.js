const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  mrp: Number,
  price: Number,
  subtotal: Number,
  inStock: String,
  discount: String
});

const cartSchema = new mongoose.Schema({
  user: { type: String, required: true },
  items: [cartItemSchema],
  total: Number
});

module.exports = mongoose.model('Cart', cartSchema); 