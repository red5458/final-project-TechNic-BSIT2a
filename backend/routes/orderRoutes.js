//Refine orderRoutes for improved clarity and structure
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
    cancelOrder,
    markAsDelivered,
} = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.get('/', auth, getCurrentBuyerOrders);
router.get('/buyer/:userId', auth, getBuyerOrders);
router.get('/seller/:sellerId', auth, getSellerOrders);
router.get('/:orderId', auth, getOrderById);
router.patch('/item/:itemId/fulfill', auth, fulfillOrderItem);
router.patch('/:orderId/cancel', auth, cancelOrder);
router.patch('/:orderId/deliver', auth, markAsDelivered);

module.exports = router;
