const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const { user } = req.query;
    const cart = await Cart.findOne({ user });
    res.json(cart || { user, items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { user, items, total } = req.body;
    let cart = await Cart.findOne({ user });
    if (cart) {
      cart.items = items;
      cart.total = total;
      await cart.save();
    } else {
      cart = new Cart({ user, items, total });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 