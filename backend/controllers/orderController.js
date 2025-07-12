const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getAllOrders = async (req, res) => {
  try {
    const { user } = req.query;
    let orders = user ? await Order.find({ user }) : await Order.find();
    // Fetch user names for each order
    const users = await User.find({ email: { $in: orders.map(o => o.user) } });
    const userMap = {};
    users.forEach(u => { userMap[u.email] = u.username; });
    const formatted = orders.map((o, i) => ({
      icon: null, // Optionally assign an icon based on i or status
      name: userMap[o.user] || o.user || 'User',
      goods: o.products && o.products.length > 0 ? `${o.products[0].name} (${o.products[0].quantity})` : 'N/A',
      status: o.status,
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      email: o.user // Always include email for frontend filtering
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const { user } = req.params;
    const orders = await Order.find({ user });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { user, products, total } = req.body;
    // Update stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    const order = new Order({ user, products, total });
    await order.save();
    // Create notification
    await Notification.create({ user, message: `Order placed: ${order._id}`, type: 'order' });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 