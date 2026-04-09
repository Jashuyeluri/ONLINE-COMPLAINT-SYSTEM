const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint({
      ...req.body,
      createdBy: req.user.id
    });
    await complaint.save();

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'new_complaint',
      message: `A new complaint has been raised: ${complaint.title}`,
      complaintId: complaint._id
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query.createdBy = req.user.id;
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user.id;
    }
    // admin sees all
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Notify User
    await Notification.create({
      recipient: complaint.createdBy,
      type: 'status_update',
      message: `Your complaint "${complaint.title}" is now ${status}`,
      complaintId: complaint._id
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin assigns a complaint to a staff member
exports.assignComplaint = async (req, res) => {
  try {
    const { staffId } = req.body;
    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: staffId, status: 'In Progress' },
      { new: true }
    ).populate('createdBy', 'name email').populate('assignedTo', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Notify Staff of assignment
    await Notification.create({
      recipient: staffId,
      type: 'assigned_to_staff',
      message: `You have been assigned a new complaint: "${complaint.title}"`,
      complaintId: complaint._id
    });

    // Notify Citizen
    await Notification.create({
      recipient: complaint.createdBy._id,
      type: 'status_update',
      message: `Your complaint "${complaint.title}" has been assigned to staff and is now In Progress`,
      complaintId: complaint._id
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Staff marks a complaint as completed
exports.staffCompleteComplaint = async (req, res) => {
  try {
    const { staffNote } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This complaint is not assigned to you' });
    }

    complaint.status = 'Completed';
    complaint.staffNote = staffNote || 'Work completed';
    await complaint.save();

    // Notify Admin that staff completed the work
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'staff_completed',
      message: `Staff has completed work on complaint: "${complaint.title}". Please review and update.`,
      complaintId: complaint._id
    }));
    await Notification.insertMany(notifications);

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
