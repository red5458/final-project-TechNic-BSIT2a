const Size = require('../models/Size');
const Product = require('../models/Product');

exports.createSize = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim().toUpperCase();
        const sort_order = Number(req.body.sort_order || 0);

        if (!name) {
            return res.status(400).json({ error: 'Size name is required.' });
        }

        const size = new Size({ name, sort_order });
        await size.save();
        res.status(201).json(size);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllSizes = async (req, res) => {
    try {
        const sizes = await Size.find().sort({ sort_order: 1, name: 1 });
        res.json(sizes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSize = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim().toUpperCase();
        const sort_order = Number(req.body.sort_order || 0);

        if (!name) {
            return res.status(400).json({ error: 'Size name is required.' });
        }

        const size = await Size.findByIdAndUpdate(
            req.params.id,
            { name, sort_order },
            { new: true, runValidators: true }
        );

        if (!size) {
            return res.status(404).json({ error: 'Size not found.' });
        }

        res.json(size);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteSize = async (req, res) => {
    try {
        const size = await Size.findById(req.params.id);
        if (!size) {
            return res.status(404).json({ error: 'Size not found.' });
        }

        const usedByProducts = await Product.countDocuments({ size: size.name });
        if (usedByProducts > 0) {
            return res.status(400).json({ error: 'Size is used by existing products.' });
        }

        await Size.findByIdAndDelete(req.params.id);
        res.json({ message: 'Size deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
