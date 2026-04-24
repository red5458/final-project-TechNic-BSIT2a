const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createUser, getAllUsers, getUserById, getUserStats, updateUser, deleteUser } = require('../controllers/userController');

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id/stats', auth, getUserStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
