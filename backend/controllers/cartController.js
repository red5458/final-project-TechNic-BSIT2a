const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

exports.getOrCreateCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user_id: req.params.userId });
        if (!cart) cart = await Cart.create({ user_id: req.params.userId });
        const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
        res.json({ cart, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { cart_id, product_id, quantity } = req.body;
        const item = new CartItem({ cart_id, product_id, quantity });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        await CartItem.findByIdAndDelete(req.params.itemId);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};