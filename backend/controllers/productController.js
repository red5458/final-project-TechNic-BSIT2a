const Product = require('../models/Product');
const { uploadImageBuffer } = require('../config/cloudinary');

// @desc    Create a new product listing
exports.createProduct = async (req, res) => {
    try {
        let imageUrl = '';

        if (req.file) {
            const uploadResult = await uploadImageBuffer(req.file.buffer);
            imageUrl = uploadResult.secure_url;
        }

        // Build product object
        const productData = {
            ...req.body,
            // The seller_id is taken from the token (Step 2 & 3)
            seller_id: req.user.id,
            image_url: imageUrl
        };

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category_id = req.query.category;
        if (req.query.seller) filter.seller_id = req.query.seller;

        const products = await Product.find(filter)
            .populate('seller_id', 'name email phone')
            .populate('category_id', 'name');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller_id', 'name email phone')
            .populate('category_id', 'name');

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (String(product.seller_id) !== String(req.user.id)) {
            return res.status(403).json({ error: 'You can only update your own listing.' });
        }

        const updates = {
            name: req.body.name,
            category_id: req.body.category_id,
            size: req.body.size,
            price: req.body.price,
            quantity: req.body.quantity,
            description: req.body.description,
        };

        Object.keys(updates).forEach((key) => {
            if (updates[key] === undefined) delete updates[key];
        });

        if (req.file) {
            const uploadResult = await uploadImageBuffer(req.file.buffer);
            updates.image_url = uploadResult.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('seller_id', 'name email phone')
            .populate('category_id', 'name');

        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (String(product.seller_id) !== String(req.user.id)) {
            return res.status(403).json({ error: 'You can only delete your own listing.' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
