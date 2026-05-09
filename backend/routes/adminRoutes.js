const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getAdminSummary } = require('../controllers/adminController');

router.get('/me', auth, adminOnly, (req, res) => {
    res.json({ message: 'Admin access verified' });
});
router.get('/summary', auth, adminOnly, getAdminSummary);

module.exports = router;
