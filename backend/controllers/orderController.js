const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (req, res) => {
    try {
        const { buyer_id, delivery_address, total_amount, items } = req.body;
        const order = await Order.create({ buyer_id, delivery_address, total_amount });
        const orderItemsPayload = items.map(item => ({ ...item, order_id: order._id }));
        const orderItems = await OrderItem.insertMany(orderItemsPayload);
        res.status(201).json({ order, orderItems });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBuyerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer_id: req.params.userId });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        const items = await OrderItem.find({ seller_id: req.params.sellerId })
            .populate('order_id')
            .populate('product_id', 'name price image_url');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.fulfillOrderItem = async (req, res) => {
    try {
        await OrderItem.findByIdAndUpdate(req.params.itemId, { status: 'fulfilled' });
        const item = await OrderItem.findById(req.params.itemId);
        const allItems = await OrderItem.find({ order_id: item.order_id });
        const allFulfilled = allItems.every(i => i.status === 'fulfilled');
        if (allFulfilled) await Order.findByIdAndUpdate(item.order_id, { status: 'shipped' });
        res.json({ message: 'Item fulfilled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsDelivered = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.orderId, { status: 'delivered' });
        res.json({ message: 'Order marked as delivered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};