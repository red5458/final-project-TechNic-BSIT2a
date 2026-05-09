const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Size = require('../models/Size');

exports.getAdminSummary = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            totalSizes,
            pendingOrders,
            deliveredOrders,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
            Size.countDocuments(),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'delivered' }),
        ]);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            totalSizes,
            pendingOrders,
            deliveredOrders,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
