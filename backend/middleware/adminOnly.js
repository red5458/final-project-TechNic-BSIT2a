const User = require('../models/User');

module.exports = async function adminOnly(req, res, next) {
    try {
        const user = await User.findById(req.user?.id).select('role');

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access only.' });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
