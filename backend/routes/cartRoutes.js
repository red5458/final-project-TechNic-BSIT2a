const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getOrCreateCart, addToCart, removeFromCart } = require('../controllers/cartController');

router.get('/:userId', auth, getOrCreateCart);
router.post('/add', auth, addToCart);
router.delete('/item/:itemId', auth, removeFromCart);

module.exports = router;
