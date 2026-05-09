//Refine categoryRoutes file by adding a comment for CRUD operations clarity
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

router.get('/', getAllCategories);
router.post('/', auth, adminOnly, createCategory);
router.patch('/:id', auth, adminOnly, updateCategory);
router.delete('/:id', auth, adminOnly, deleteCategory);

module.exports = router;
