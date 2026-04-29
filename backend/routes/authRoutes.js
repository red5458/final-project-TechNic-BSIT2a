//Refine authRoutes for improved clarity and structure
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register - Sign up
router.post('/register', register);

// POST /api/auth/login - Log in
router.post('/login', login);

// GET /api/auth/me - Get logged-in user profile
router.get('/me', auth, getMe);

module.exports = router;
