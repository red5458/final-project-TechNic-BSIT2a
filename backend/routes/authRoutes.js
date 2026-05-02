//Refine authRoutes for improved clarity and structure
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    resendVerificationOtp,
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

// GET /api/auth/me - Get logged-in user profile
router.get('/me', auth, getMe);

module.exports = router;
