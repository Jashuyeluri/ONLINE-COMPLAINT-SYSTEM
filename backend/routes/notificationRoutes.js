const express = require('express');
const { getNotifications, markAsRead, clearNotifications } = require('../controllers/notificationController');
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/mark-read', auth, markAsRead);
router.delete('/clear', auth, clearNotifications);

module.exports = router;
