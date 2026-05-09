const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
    createSize,
    getAllSizes,
    updateSize,
    deleteSize,
} = require('../controllers/sizeController');

router.get('/', getAllSizes);
router.post('/', auth, adminOnly, createSize);
router.patch('/:id', auth, adminOnly, updateSize);
router.delete('/:id', auth, adminOnly, deleteSize);

module.exports = router;
