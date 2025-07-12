const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, updateMessage, deleteMessage } = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/', sendMessage);
router.patch('/:id', updateMessage);
router.delete('/:id', deleteMessage);

module.exports = router; 