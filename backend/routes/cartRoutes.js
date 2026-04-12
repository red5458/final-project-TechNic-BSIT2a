const express = require('express');
const router = express.Router();
const { getOrCreateCart, addToCart, removeFromCart } = require('../controllers/cartController');

router.get('/:userId', getOrCreateCart);
router.post('/add', addToCart);
router.delete('/item/:itemId', removeFromCart);

module.exports = router;