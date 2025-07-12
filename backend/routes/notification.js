const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getUserNotifications,
  createNotification,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.get('/user/:user', getUserNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router; 