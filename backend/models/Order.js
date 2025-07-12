const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: String, required: true }, // or ObjectId if referencing User
  products: [
    {
      productId: String, // or ObjectId if referencing Product
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 