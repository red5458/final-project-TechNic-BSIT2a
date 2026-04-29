//Refine CartItem model for clearer structure and validation
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
});

module.exports = mongoose.model('CartItem', cartItemSchema);