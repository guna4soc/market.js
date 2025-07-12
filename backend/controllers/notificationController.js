const Notification = require('../models/Notification');

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    
    // Transform notifications to match frontend expectations
    const transformedNotifications = notifications.map(notification => ({
      _id: notification._id,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      // Frontend expected fields with fallbacks
      icon: notification.icon || '🔔',
      text: notification.text || notification.message || 'Notification',
      time: notification.time || 'Just now'
    }));
    
    res.json(transformedNotifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { user } = req.params;
    const notifications = await Notification.find({ user }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    // Ensure the notification has the required fields for frontend
    const notificationData = {
      ...req.body,
      icon: req.body.icon || '🔔',
      text: req.body.text || req.body.message || 'Notification',
      time: req.body.time || 'Just now'
    };
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Return the transformed notification
    const transformedNotification = {
      _id: notification._id,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      icon: notification.icon,
      text: notification.text,
      time: notification.time
    };
    
    res.status(201).json(transformedNotification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 