//Refine authRoutes for improved clarity and structure
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    resendVerificationOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getMe,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register - Sign up
router.post('/register', register);

// POST /api/auth/login - Log in
router.post('/login', login);

// POST /api/auth/verify-email - Verify registration OTP
router.post('/verify-email', verifyEmail);

// POST /api/auth/resend-verification-otp - Resend registration OTP
router.post('/resend-verification-otp', resendVerificationOtp);

// POST /api/auth/forgot-password - Send password reset OTP
router.post('/forgot-password', forgotPassword);

// POST /api/auth/verify-reset-otp - Verify password reset OTP
router.post('/verify-reset-otp', verifyResetOtp);

// POST /api/auth/reset-password - Set new password after OTP verification
router.post('/reset-password', resetPassword);

// GET /api/auth/me - Get logged-in user profile
router.get('/me', auth, getMe);

module.exports = router;
