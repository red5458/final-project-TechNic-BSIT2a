//Refine authRoutes for improved clarity and structure
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register - Sign up
router.post('/register', register);

// POST /api/auth/verify-email - Verify email OTP
router.post('/verify-email', verifyEmail);

// POST /api/auth/resend-otp - Resend verification OTP
router.post('/resend-otp', resendOtp);

// POST /api/auth/login - Log in
router.post('/login', login);

// POST /api/auth/forgot-password - Send reset OTP
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password using OTP
router.post('/reset-password', resetPassword);

// GET /api/auth/me - Get logged-in user profile
router.get('/me', auth, getMe);

module.exports = router;
