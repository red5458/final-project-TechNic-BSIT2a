const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/me', auth, adminOnly, (req, res) => {
    res.json({ message: 'Admin access verified' });
});

module.exports = router;
