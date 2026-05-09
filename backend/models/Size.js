const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sort_order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Size', sizeSchema);
