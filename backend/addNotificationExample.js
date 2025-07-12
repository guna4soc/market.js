require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI);

// Example 1: Add a notification with all frontend fields
const notification1 = {
  message: 'New order received from customer John Doe',
  type: 'order',
  icon: '📦',
  text: 'New order received from customer John Doe',
  time: '1 min ago'
};

// Example 2: Add a notification with minimal fields (will be transformed by controller)
const notification2 = {
  message: 'Stock level low for Fresh Vegetables',
  type: 'stock'
};

// Example 3: Add a notification with custom icon and time
const notification3 = {
  message: 'Payment confirmed for order #5678',
  type: 'payment',
  icon: '💰',
  text: 'Payment confirmed for order #5678',
  time: '5 min ago'
};

// Example 4: Add a notification with just message (will use defaults)
const notification4 = {
  message: 'New user registered: sarah@example.com',
  type: 'user'
};

async function addNotificationExamples() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    // Add the example notifications
    const notifications = [notification1, notification2, notification3, notification4];
    
    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log('Added notification:', notificationData.message);
    }
    
    // Get total count
    const totalCount = await Notification.countDocuments();
    console.log('Total notifications in database:', totalCount);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('\n✅ Notifications added successfully!');
    console.log('📱 Check your React frontend to see the new notifications');
    console.log('🔄 The frontend will automatically refresh every 30 seconds');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addNotificationExamples(); 