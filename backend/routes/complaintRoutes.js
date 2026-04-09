const express = require('express');
const { 
  createComplaint, 
  getComplaints, 
  getComplaintById, 
  updateComplaintStatus, 
  assignComplaint,
  staffCompleteComplaint,
  deleteComplaint 
} = require('../controllers/complaintController');
const { auth, admin, staff } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, createComplaint);
router.get('/', auth, getComplaints);
router.get('/:id', auth, getComplaintById);
router.put('/:id', auth, admin, updateComplaintStatus);
router.put('/:id/assign', auth, admin, assignComplaint);
router.put('/:id/complete', auth, staff, staffCompleteComplaint);
router.delete('/:id', auth, admin, deleteComplaint);

module.exports = router;
