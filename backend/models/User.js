//Refine User model schema for clarity and structure
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOtpHash: { type: String, default: null },
  emailVerificationOtpExpiresAt: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
