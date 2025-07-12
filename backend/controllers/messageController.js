const Message = require('../models/Message');

// Get all messages for a user (received or sent)
exports.getMessages = async (req, res) => {
  try {
    const { user, from } = req.query;
    let query = {};
    if (user && from) {
      query = { $or: [{ user }, { from }] };
    } else if (user) {
      query = { user };
    } else if (from) {
      query = { from };
    } else {
      return res.status(400).json({ error: 'User email or from required' });
    }
    const messages = await Message.find(query).sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send (create) a new message
exports.sendMessage = async (req, res) => {
  try {
    const { user, from, subject, content, date } = req.body;
    if (!user || !from || !subject || !content) return res.status(400).json({ error: 'Missing fields' });
    const message = new Message({ user, from, subject, content, date });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Update message (read, starred, important, archived)
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const message = await Message.findByIdAndUpdate(id, update, { new: true });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
}; 