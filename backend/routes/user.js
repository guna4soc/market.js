const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePreferences, deleteAccount } = require('../controllers/userController');

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/preferences', updatePreferences);
router.delete('/delete', deleteAccount);

module.exports = router; 