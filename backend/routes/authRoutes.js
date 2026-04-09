const express = require('express');
const { register, login, getAllUsers, getAllStaff } = require('../controllers/authController');
const { auth, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', auth, admin, getAllUsers);
router.get('/staff', auth, admin, getAllStaff);

module.exports = router;
