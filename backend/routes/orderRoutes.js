const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createOrder,
    getCurrentBuyerOrders,
    getBuyerOrders,
    getOrderById,
    getSellerOrders,
    fulfillOrderItem,
    markAsDelivered,
} = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.get('/', auth, getCurrentBuyerOrders);
router.get('/buyer/:userId', auth, getBuyerOrders);
router.get('/seller/:sellerId', auth, getSellerOrders);
router.get('/:orderId', auth, getOrderById);
router.patch('/item/:itemId/fulfill', auth, fulfillOrderItem);
router.patch('/:orderId/deliver', auth, markAsDelivered);

module.exports = router;
