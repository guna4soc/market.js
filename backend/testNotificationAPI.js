const axios = require('axios');

const API_URL = 'http://localhost:5000/api/notification';

// Test notification data
const testNotifications = [
  {
    message: 'API Test: New order received via API',
    type: 'order',
    icon: '📦',
    text: 'API Test: New order received via API',
    time: 'just now'
  },
  {
    message: 'API Test: Payment processed via API',
    type: 'payment',
    icon: '💰',
    text: 'API Test: Payment processed via API',
    time: '1 min ago'
  },
  {
    message: 'API Test: Stock alert via API',
    type: 'stock',
    icon: '⚠️',
    text: 'API Test: Stock alert via API',
    time: '2 min ago'
  }
];

async function testNotificationAPI() {
  console.log('Testing notification API...\n');
  
  for (const notification of testNotifications) {
    try {
      console.log('Adding notification:', notification.message);
      
      const response = await axios.post(API_URL, notification);
      console.log('✅ Successfully added notification:', response.data.text);
    } catch (error) {
      console.log('❌ Error adding notification:', error.message);
    }
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 API test completed!');
  console.log('📱 Check your React frontend to see the new notifications');
}

testNotificationAPI(); 