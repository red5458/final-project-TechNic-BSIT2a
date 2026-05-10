const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
    getAdminSummary,
    getAdminUsers,
    updateAdminUser,
    getAdminProducts,
    updateAdminProduct,
    getAdminOrders,
    updateAdminOrder,
    updateAdminOrderItem,
} = require('../controllers/adminController');

router.get('/me', auth, adminOnly, (req, res) => {
    res.json({ message: 'Admin access verified' });
});
router.get('/summary', auth, adminOnly, getAdminSummary);
router.get('/users', auth, adminOnly, getAdminUsers);
router.patch('/users/:userId', auth, adminOnly, updateAdminUser);
router.get('/products', auth, adminOnly, getAdminProducts);
router.patch('/products/:productId', auth, adminOnly, updateAdminProduct);
router.get('/orders', auth, adminOnly, getAdminOrders);
router.patch('/orders/:orderId', auth, adminOnly, updateAdminOrder);
router.patch('/order-items/:itemId', auth, adminOnly, updateAdminOrderItem);

module.exports = router;
