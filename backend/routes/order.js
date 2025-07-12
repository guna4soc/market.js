const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.get('/user/:user', getOrdersByUser);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router; 