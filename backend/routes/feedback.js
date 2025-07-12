const express = require('express');
const router = express.Router();
const { getFeedback, submitFeedback, updateFeedback, deleteFeedback } = require('../controllers/feedbackController');

router.get('/', getFeedback);
router.post('/', submitFeedback);
router.patch('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router; 