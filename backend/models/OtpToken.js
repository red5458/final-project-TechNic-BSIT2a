const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, required: true, lowercase: true, trim: true },
  purpose: {
    type: String,
    enum: ['verify_email', 'forgot_password', 'change_password'],
    required: true,
  },
  otp_hash: { type: String, required: true },
  reset_token_hash: { type: String, default: '' },
  reset_token_expires_at: { type: Date, default: null },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  expires_at: { type: Date, required: true },
  resend_available_at: { type: Date, required: true },
}, {
  timestamps: true,
});

otpTokenSchema.index({ email: 1, purpose: 1, used: 1 });
otpTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
