const express = require('express');
const router = express.Router();
const { createOrder, getBuyerOrders, getSellerOrders, fulfillOrderItem, markAsDelivered } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/buyer/:userId', getBuyerOrders);
router.get('/seller/:sellerId', getSellerOrders);
router.patch('/item/:itemId/fulfill', fulfillOrderItem);
router.patch('/:orderId/deliver', markAsDelivered);

module.exports = router;