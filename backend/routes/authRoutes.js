//Refine authRoutes for improved clarity and structure
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    verifyEmail,
    resendOtp,
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

// GET /api/auth/me - Get logged-in user profile
router.get('/me', auth, getMe);

module.exports = router;
