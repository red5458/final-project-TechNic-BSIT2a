//Implement order creation functionality: validate delivery address and items, calculate total amount
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

async function attachItems(orderDocs) {
    const orders = Array.isArray(orderDocs) ? orderDocs : [orderDocs];
    const orderIds = orders.map((order) => order._id);

    const items = await OrderItem.find({ order_id: { $in: orderIds } })
        .populate({
            path: 'product_id',
            select: 'name price image_url size category_id seller_id',
            populate: [
                { path: 'category_id', select: 'name' },
                { path: 'seller_id', select: 'name email' },
            ],
        })
        .populate('seller_id', 'name email');

    return orders.map((order) => {
        const plainOrder = order.toObject ? order.toObject() : order;
        return {
            ...plainOrder,
            items: items.filter((item) => String(item.order_id) === String(order._id)),
        };
    });
}

exports.createOrder = async (req, res) => {
    const reservedProducts = [];
    const createdOrders = [];

    try {
        const { delivery_address, items } = req.body;

        if (!delivery_address || !String(delivery_address).trim()) {
            return res.status(400).json({ error: 'Delivery address is required.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Your order is empty.' });
        }

        const normalizedItems = [];

        for (const item of items) {
            const qty = Number(item.quantity);

            if (!item.product_id || !Number.isInteger(qty) || qty < 1) {
                throw new Error('Invalid order quantity.');
            }

            const product = await Product.findById(item.product_id).select('price seller_id quantity');
            if (!product) {
                throw new Error('One or more products no longer exist.');
            }

            if (String(product.seller_id) !== String(item.seller_id)) {
                throw new Error('Seller information does not match the product.');
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product_id, quantity: { $gte: qty } },
                { $inc: { quantity: -qty } },
                { new: true }
            ).select('name quantity');

            if (!updatedProduct) {
                throw new Error('One or more items do not have enough stock.');
            }

            reservedProducts.push({ product_id: item.product_id, quantity: qty });
            normalizedItems.push({
                product_id: item.product_id,
                seller_id: product.seller_id,
                quantity: qty,
                price: Number(product.price || 0),
            });
        }

        const itemsBySeller = normalizedItems.reduce((groups, item) => {
            const sellerId = String(item.seller_id);
            if (!groups[sellerId]) groups[sellerId] = [];
            groups[sellerId].push(item);
            return groups;
        }, {});

        const orderItemsPayload = [];

        for (const sellerItems of Object.values(itemsBySeller)) {
            const totalAmount = sellerItems.reduce(
                (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
                0
            );

            const order = await Order.create({
                buyer_id: req.user.id,
                delivery_address,
                total_amount: totalAmount,
            });
            createdOrders.push(order);

            sellerItems.forEach((item) => {
                orderItemsPayload.push({
                    order_id: order._id,
                    product_id: item.product_id,
                    seller_id: item.seller_id,
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                });
            });
        }

        await OrderItem.insertMany(orderItemsPayload);

        const cart = await Cart.findOne({ user_id: req.user.id });
        if (cart) {
            await CartItem.deleteMany({ cart_id: cart._id });
        }

        const fullOrders = await attachItems(createdOrders);
        res.status(201).json(fullOrders.length === 1 ? fullOrders[0] : fullOrders);
    } catch (err) {
        if (reservedProducts.length) {
            for (const item of reservedProducts) {
                await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: item.quantity } }).catch(() => null);
            }
        }
        if (createdOrders.length) {
            const createdOrderIds = createdOrders.map((order) => order._id);
            await OrderItem.deleteMany({ order_id: { $in: createdOrderIds } }).catch(() => null);
            await Order.deleteMany({ _id: { $in: createdOrderIds } }).catch(() => null);
        }
        res.status(400).json({ error: err.message });
    }
};

exports.getCurrentBuyerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer_id: req.user.id })
            .sort({ created_at: -1 })
            .populate('buyer_id', 'name email');

        const hydratedOrders = await attachItems(orders);
        res.json(hydratedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBuyerOrders = async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const orders = await Order.find({ buyer_id: req.params.userId })
            .sort({ created_at: -1 })
            .populate('buyer_id', 'name email');

        const hydratedOrders = await attachItems(orders);
        res.json(hydratedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('buyer_id', 'name email');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const isOwner = String(order.buyer_id?._id || order.buyer_id) === String(req.user.id);
        const isSeller = await OrderItem.exists({
            order_id: order._id,
            seller_id: req.user.id,
        });

        if (!isOwner && !isSeller) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const [fullOrder] = await attachItems(order);
        res.json(fullOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.sellerId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const sellerItems = await OrderItem.find({ seller_id: req.params.sellerId })
            .populate({
                path: 'product_id',
                select: 'name price image_url size category_id seller_id',
                populate: [
                    { path: 'category_id', select: 'name' },
                    { path: 'seller_id', select: 'name email' },
                ],
            });

        const orderIds = [...new Set(sellerItems.map((item) => String(item.order_id)))];
        const orders = await Order.find({ _id: { $in: orderIds } })
            .sort({ created_at: -1 })
            .populate('buyer_id', 'name email');

        const grouped = orders.map((order) => {
            const orderId = String(order._id);
            return {
                ...(order.toObject ? order.toObject() : order),
                items: sellerItems.filter((item) => String(item.order_id) === orderId),
            };
        });

        res.json(grouped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.fulfillOrderItem = async (req, res) => {
    try {
        const item = await OrderItem.findById(req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Order item not found' });

        if (String(item.seller_id) !== String(req.user.id)) {
            return res.status(403).json({ error: 'You can only fulfill your own order items.' });
        }

        if (item.status === 'fulfilled') {
            return res.json({ message: 'Item already fulfilled' });
        }

        item.status = 'fulfilled';
        await item.save();

        const allItems = await OrderItem.find({ order_id: item.order_id });
        const allFulfilled = allItems.every((orderItem) => orderItem.status === 'fulfilled');

        if (allFulfilled) {
            await Order.findByIdAndUpdate(item.order_id, { status: 'shipped' });
        }

        res.json({ message: 'Item fulfilled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (String(order.buyer_id) !== String(req.user.id)) {
            return res.status(403).json({ error: 'You can only update your own order.' });
        }

        if (order.status !== 'shipped') {
            return res.status(400).json({ error: 'Only shipped orders can be marked as delivered.' });
        }

        order.status = 'delivered';
        await order.save();

        res.json({ message: 'Order marked as delivered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
