const express = require('express');
const router = express.Router();
const { submitHelp, getHelpRequests } = require('../controllers/helpController');

router.post('/', submitHelp);
router.get('/', getHelpRequests); // (optional, for admin/support)

module.exports = router; 