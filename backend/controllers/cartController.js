const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

exports.getOrCreateCart = async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ error: 'You can only access your own cart.' });
        }

        let cart = await Cart.findOne({ user_id: req.params.userId });
        if (!cart) cart = await Cart.create({ user_id: req.params.userId });
        const items = await CartItem.find({ cart_id: cart._id }).populate({
            path: 'product_id',
            populate: [
                { path: 'seller_id', select: 'name email' },
                { path: 'category_id', select: 'name' },
            ],
        });
        res.json({ cart, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { cart_id, product_id, quantity } = req.body;
        const requestedQty = Number(quantity);

        if (!cart_id || !product_id || !Number.isInteger(requestedQty) || requestedQty < 1) {
            return res.status(400).json({ error: 'Invalid cart item request.' });
        }

        const cart = await Cart.findById(cart_id);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }
        if (cart.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only update your own cart.' });
        }

        const product = await Product.findById(product_id).select('quantity name');
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const existingItem = await CartItem.findOne({ cart_id, product_id });
        const currentQtyInCart = existingItem ? Number(existingItem.quantity || 0) : 0;
        const nextQty = currentQtyInCart + requestedQty;

        if (nextQty > Number(product.quantity || 0)) {
            return res.status(400).json({
                error: `Only ${product.quantity} item(s) available for ${product.name}.`,
            });
        }

        let item;
        if (existingItem) {
            existingItem.quantity = nextQty;
            item = await existingItem.save();
        } else {
            item = new CartItem({ cart_id, product_id, quantity: requestedQty });
            await item.save();
        }

        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const item = await CartItem.findById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }

        const cart = await Cart.findById(item.cart_id);
        if (!cart || cart.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only update your own cart.' });
        }

        await item.deleteOne();
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
