require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/market', require('./routes/market'));
app.use('/api/order', require('./routes/order'));
app.use('/api/favourite', require('./routes/favourite'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/message', require('./routes/message'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/help', require('./routes/help'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/category', require('./routes/category'));
app.use('/api/user', require('./routes/user'));
app.use('/api/notification', require('./routes/notification'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT, () => console.log('Server running')))
  .catch(err => console.log(err)); 