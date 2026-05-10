//Refine Order model schema for clarity and structure
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  delivery_address: { type: String, required: true },
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  hidden_for_buyer: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
