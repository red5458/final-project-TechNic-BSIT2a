const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Category = require('../models/Category');

const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];
const ORDER_ITEM_STATUSES = ['pending', 'fulfilled', 'cancelled'];

exports.getAdminSummary = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            pendingOrders,
            deliveredOrders,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'delivered' }),
        ]);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            pendingOrders,
            deliveredOrders,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ created_at: -1 });

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAdminUser = async (req, res) => {
    try {
        const updates = {};
        const targetUserId = req.params.userId;
        const isSelf = String(req.user.id) === String(targetUserId);

        if (req.body.name !== undefined) {
            const name = String(req.body.name || '').trim();
            if (!name) return res.status(400).json({ error: 'Name is required.' });
            updates.name = name;
        }

        if (req.body.email !== undefined) {
            const email = String(req.body.email || '').trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Please enter a valid email address.' });
            }

            const emailOwner = await User.findOne({ email, _id: { $ne: targetUserId } }).select('_id');
            if (emailOwner) return res.status(400).json({ error: 'Email is already in use.' });
            updates.email = email;
        }

        if (req.body.phone !== undefined) {
            updates.phone = String(req.body.phone || '').trim();
        }

        if (req.body.role !== undefined) {
            if (!['user', 'admin'].includes(req.body.role)) {
                return res.status(400).json({ error: 'Invalid role.' });
            }

            if (isSelf && req.body.role !== 'admin') {
                return res.status(400).json({ error: 'You cannot remove your own admin role.' });
            }

            updates.role = req.body.role;
        }

        if (req.body.status !== undefined) {
            if (!['active', 'disabled'].includes(req.body.status)) {
                return res.status(400).json({ error: 'Invalid status.' });
            }

            if (isSelf && req.body.status === 'disabled') {
                return res.status(400).json({ error: 'You cannot disable your own account.' });
            }

            updates.status = req.body.status;
        }

        const user = await User.findByIdAndUpdate(
            targetUserId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller_id', 'name email')
            .populate('category_id', 'name')
            .sort({ created_at: -1 });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAdminProduct = async (req, res) => {
    try {
        const updates = {};

        if (req.body.name !== undefined) {
            const name = String(req.body.name || '').trim();
            if (!name) return res.status(400).json({ error: 'Product name is required.' });
            updates.name = name;
        }

        if (req.body.category_id !== undefined) {
            if (!req.body.category_id) return res.status(400).json({ error: 'Category is required.' });
            updates.category_id = req.body.category_id;
        }

        if (req.body.size !== undefined) {
            const size = String(req.body.size || '').trim();
            if (!size) return res.status(400).json({ error: 'Size is required.' });
            updates.size = size;
        }

        if (req.body.quantity !== undefined) {
            const quantity = Number(req.body.quantity);
            if (!Number.isFinite(quantity) || quantity < 0) {
                return res.status(400).json({ error: 'Quantity must be 0 or higher.' });
            }
            updates.quantity = quantity;
        }

        if (req.body.price !== undefined) {
            const price = Number(req.body.price);
            if (!Number.isFinite(price) || price < 1) {
                return res.status(400).json({ error: 'Price must be at least 1.' });
            }
            updates.price = price;
        }

        if (req.body.description !== undefined) {
            updates.description = String(req.body.description || '').trim();
        }

        if (req.body.status !== undefined) {
            if (!['active', 'removed'].includes(req.body.status)) {
                return res.status(400).json({ error: 'Invalid product status.' });
            }

            updates.status = req.body.status;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            updates,
            { new: true, runValidators: true }
        )
            .populate('seller_id', 'name email')
            .populate('category_id', 'name');

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer_id', 'name email phone')
            .sort({ created_at: -1 });

        const orderIds = orders.map((order) => order._id);
        const items = await OrderItem.find({ order_id: { $in: orderIds } })
            .populate({
                path: 'product_id',
                select: 'name size image_url category_id',
                populate: { path: 'category_id', select: 'name' },
            })
            .populate('seller_id', 'name email');

        const hydratedOrders = orders.map((order) => {
            const orderId = String(order._id);
            return {
                ...(order.toObject ? order.toObject() : order),
                items: items.filter((item) => String(item.order_id) === orderId),
            };
        });

        res.json(hydratedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAdminOrder = async (req, res) => {
    try {
        const { status } = req.body;
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Invalid order status.' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'Order not found.' });

        const previousStatus = order.status;
        const items = await OrderItem.find({ order_id: order._id });

        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            for (const item of items) {
                if (item.status !== 'cancelled') {
                    await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: Number(item.quantity || 0) } });
                }
            }
            await OrderItem.updateMany({ order_id: order._id }, { status: 'cancelled' });
        }

        if (status !== 'cancelled' && previousStatus === 'cancelled') {
            return res.status(400).json({ error: 'Cancelled orders cannot be reopened.' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order updated.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateAdminOrderItem = async (req, res) => {
    try {
        const { status } = req.body;
        if (!ORDER_ITEM_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Invalid item status.' });
        }

        const item = await OrderItem.findById(req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Order item not found.' });

        const order = await Order.findById(item.order_id);
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        if (order.status === 'cancelled') {
            return res.status(400).json({ error: 'Items in cancelled orders cannot be updated.' });
        }

        if (item.status === 'cancelled' && status !== 'cancelled') {
            return res.status(400).json({ error: 'Cancelled items cannot be reopened.' });
        }

        if (status === 'cancelled' && item.status !== 'cancelled') {
            await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: Number(item.quantity || 0) } });
        }

        item.status = status;
        await item.save();

        const items = await OrderItem.find({ order_id: item.order_id });
        if (items.every((orderItem) => orderItem.status === 'cancelled')) {
            order.status = 'cancelled';
        } else if (items.every((orderItem) => orderItem.status === 'fulfilled')) {
            order.status = 'shipped';
        } else if (order.status === 'shipped' && items.some((orderItem) => orderItem.status === 'pending')) {
            order.status = 'pending';
        }
        await order.save();

        res.json({ message: 'Order item updated.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
