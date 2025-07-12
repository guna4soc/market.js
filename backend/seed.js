require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI);

const initialProducts = [
  { name: 'Tomato', price: 20, category: 'Vegetables', stock: 120 },
  { name: 'Jeans', price: 500, category: 'Fashion', stock: 40 },
  { name: 'iPhone', price: 60000, category: 'Mobiles', stock: 10 },
  { name: 'Desk', price: 2000, category: 'Office', stock: 25 },
  { name: 'Apple', price: 80, category: 'Fruits', stock: 60 },
];

const initialCategories = [
  { label: 'Vegetables' },
  { label: 'Fashion' },
  { label: 'Mobiles' },
  { label: 'Office' },
  { label: 'Fruits' },
  { label: 'Computers' },
];

const initialNotifications = [
  { 
    message: 'The fruit is almost finished, quickly refill', 
    type: 'stock',
    icon: '🍎',
    text: 'The fruit is almost finished, quickly refill',
    time: '2 min ago'
  },
  { 
    message: 'Vegetable stocks have been filled', 
    type: 'stock',
    icon: '🥬',
    text: 'Vegetable stocks have been filled',
    time: '5 min ago'
  },
  { 
    message: 'Fish stock has been reordered', 
    type: 'stock',
    icon: '🐟',
    text: 'Fish stock has been reordered',
    time: '10 min ago'
  },
  { 
    message: 'Fish orders have been refilled', 
    type: 'order',
    icon: '📦',
    text: 'Fish orders have been refilled',
    time: '15 min ago'
  },
  { 
    message: 'New user registered', 
    type: 'user',
    icon: '👤',
    text: 'New user registered',
    time: '20 min ago'
  },
  { 
    message: 'Order placed', 
    type: 'order',
    icon: '✅',
    text: 'Order placed',
    time: '25 min ago'
  },
  { 
    message: 'Payment confirmed for order #1234', 
    type: 'payment',
    icon: '💰',
    text: 'Payment confirmed for order #1234',
    time: '30 min ago'
  },
  { 
    message: 'Low stock alert: Premium Meat', 
    type: 'stock',
    icon: '⚠️',
    text: 'Low stock alert: Premium Meat',
    time: '35 min ago'
  },
  { 
    message: 'New product added: Organic Herbs', 
    type: 'product',
    icon: '🌿',
    text: 'New product added: Organic Herbs',
    time: '40 min ago'
  },
  { 
    message: 'Customer feedback received', 
    type: 'feedback',
    icon: '💬',
    text: 'Customer feedback received',
    time: '45 min ago'
  }
];

const initialOrders = [
  {
    user: 'guna4soc@gmail.com',
    products: [
      { productId: '1', name: 'Tomato', price: 20, quantity: 5 },
      { productId: '5', name: 'Apple', price: 80, quantity: 2 }
    ],
    total: 20 * 5 + 80 * 2,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    user: 'naveen@outlook.com',
    products: [
      { productId: '2', name: 'Jeans', price: 500, quantity: 1 }
    ],
    total: 500,
    status: 'Pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
  },
  {
    user: 'ariana@gmail.com',
    products: [
      { productId: '3', name: 'iPhone', price: 60000, quantity: 1 }
    ],
    total: 60000,
    status: 'Accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    user: 'reshmi@outlook.com',
    products: [
      { productId: '4', name: 'Desk', price: 2000, quantity: 2 }
    ],
    total: 4000,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 10)
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(initialProducts);
    console.log('Seeded products');
  }
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(initialCategories);
    console.log('Seeded categories');
  }
  if ((await Notification.countDocuments()) === 0) {
    await Notification.insertMany(initialNotifications);
    console.log('Seeded notifications');
  }
  if ((await Order.countDocuments()) === 0) {
    await Order.insertMany(initialOrders);
    console.log('Seeded orders');
  }
  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed(); 