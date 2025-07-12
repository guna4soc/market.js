require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI);

const notificationTemplates = [
  {
    message: 'New customer registered',
    type: 'user',
    icon: '👤',
    text: 'New customer registered',
    time: 'just now'
  },
  {
    message: 'Order status updated to "Shipped"',
    type: 'order',
    icon: '🚚',
    text: 'Order status updated to "Shipped"',
    time: 'just now'
  },
  {
    message: 'Low stock alert: Fresh Vegetables',
    type: 'stock',
    icon: '⚠️',
    text: 'Low stock alert: Fresh Vegetables',
    time: 'just now'
  },
  {
    message: 'Payment received for order #1234',
    type: 'payment',
    icon: '💰',
    text: 'Payment received for order #1234',
    time: 'just now'
  },
  {
    message: 'New product review received',
    type: 'feedback',
    icon: '⭐',
    text: 'New product review received',
    time: 'just now'
  },
  {
    message: 'Inventory count completed',
    type: 'audit',
    icon: '📋',
    text: 'Inventory count completed',
    time: 'just now'
  },
  {
    message: 'New discount code generated',
    type: 'marketing',
    icon: '🎫',
    text: 'New discount code generated',
    time: 'just now'
  },
  {
    message: 'System backup completed',
    type: 'system',
    icon: '💾',
    text: 'System backup completed',
    time: 'just now'
  }
];

function getRandomTime() {
  const times = ['just now', '1 min ago', '2 min ago', '3 min ago', '5 min ago'];
  return times[Math.floor(Math.random() * times.length)];
}

async function addRandomNotification() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Pick a random notification template
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const notification = {
      ...template,
      time: getRandomTime()
    };
    
    // Add the notification
    await Notification.create(notification);
    console.log('Added notification:', notification.text);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error adding notification:', err);
  }
}

// Add a notification every 30 seconds
console.log('Starting notification simulation...');
console.log('Adding a new notification every 30 seconds...');
console.log('Press Ctrl+C to stop');

setInterval(addRandomNotification, 30000);

// Add initial notification
addRandomNotification(); 