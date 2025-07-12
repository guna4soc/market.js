require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI);

const additionalNotifications = [
  {
    message: 'New order #5678 received from customer',
    type: 'order',
    icon: '📦',
    text: 'New order #5678 received from customer',
    time: '1 min ago'
  },
  {
    message: 'Payment processed successfully for order #5678',
    type: 'payment',
    icon: '💰',
    text: 'Payment processed successfully for order #5678',
    time: '3 min ago'
  },
  {
    message: 'Stock level critical for Fresh Seafood',
    type: 'stock',
    icon: '⚠️',
    text: 'Stock level critical for Fresh Seafood',
    time: '7 min ago'
  },
  {
    message: 'Customer review received - 5 stars!',
    type: 'feedback',
    icon: '⭐',
    text: 'Customer review received - 5 stars!',
    time: '12 min ago'
  },
  {
    message: 'New product category added: Electronics',
    type: 'product',
    icon: '📱',
    text: 'New product category added: Electronics',
    time: '18 min ago'
  },
  {
    message: 'Weekly sales report generated',
    type: 'report',
    icon: '📊',
    text: 'Weekly sales report generated',
    time: '25 min ago'
  },
  {
    message: 'Inventory audit completed',
    type: 'audit',
    icon: '✅',
    text: 'Inventory audit completed',
    time: '32 min ago'
  },
  {
    message: 'New supplier registered',
    type: 'supplier',
    icon: '🏢',
    text: 'New supplier registered',
    time: '40 min ago'
  },
  {
    message: 'Discount campaign launched',
    type: 'marketing',
    icon: '🎉',
    text: 'Discount campaign launched',
    time: '45 min ago'
  },
  {
    message: 'System maintenance scheduled for tonight',
    type: 'system',
    icon: '🔧',
    text: 'System maintenance scheduled for tonight',
    time: '50 min ago'
  }
];

async function addNotifications() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    // Add the new notifications
    await Notification.insertMany(additionalNotifications);
    console.log('Added', additionalNotifications.length, 'new notifications');
    
    // Get total count
    const totalCount = await Notification.countDocuments();
    console.log('Total notifications in database:', totalCount);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addNotifications(); 