//Refine categoryRoutes file by adding a comment for CRUD operations clarity
const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, deleteCategory } = require('../controllers/categoryController');

router.post('/', createCategory);
router.get('/', getAllCategories);
router.delete('/:id', deleteCategory);

module.exports = router;