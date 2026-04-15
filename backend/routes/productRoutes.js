const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// new middlewares
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   POST /api/products
router.post('/', [auth, upload.single('image')], createProduct);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected update and delete
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;