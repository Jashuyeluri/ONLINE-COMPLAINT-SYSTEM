const express = require('express');
const {
  createQuery,
  getQueries,
  getQueryById,
  replyToQuery,
  closeQuery
} = require('../controllers/queryController');
const { auth, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, createQuery);
router.get('/', auth, getQueries);
router.get('/:id', auth, getQueryById);
router.post('/:id/reply', auth, replyToQuery);
router.put('/:id/close', auth, admin, closeQuery);

module.exports = router;
