const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updates = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone || '',
        };

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const [orders, activeListings, sellerItems] = await Promise.all([
            Order.find({ buyer_id: req.user.id, status: { $ne: 'cancelled' } }),
            Product.countDocuments({ seller_id: req.user.id, quantity: { $gt: 0 } }),
            OrderItem.find({ seller_id: req.user.id, status: { $ne: 'cancelled' } }).select('order_id price quantity status'),
        ]);

        const ordersPlaced = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const totalEarned = sellerItems
            .filter((item) => item.status === 'fulfilled')
            .reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        const ordersReceived = new Set(sellerItems.map((item) => String(item.order_id))).size;

        res.json({
            ordersPlaced,
            activeListings,
            totalSpent,
            totalEarned,
            ordersReceived,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
