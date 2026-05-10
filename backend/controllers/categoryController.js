//Refactor category controller for cleaner structure and consistent responses
const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({ error: 'Category name is required.' });
        }

        const category = new Category({ name });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({ error: 'Category name is required.' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const usedByProducts = await Product.countDocuments({ category_id: req.params.id });
        if (usedByProducts > 0) {
            return res.status(400).json({ error: 'Category is used by existing products.' });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
