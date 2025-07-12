const express = require('express');
const router = express.Router();
const { getFavourites, addFavourite } = require('../controllers/favouriteController');

router.get('/', getFavourites);
router.post('/', addFavourite);

module.exports = router; 