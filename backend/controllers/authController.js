const User = require('../models/User');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// GET /api/auth/users — admin gets all registered users with complaint stats
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ _id: -1 });

    // Get complaint stats per user
    const stats = await Complaint.aggregate([
      { $group: {
        _id: '$createdBy',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
      }}
    ]);

    const staffStats = await Complaint.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: null } } },
      { $group: {
        _id: '$assignedTo',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['Completed', 'Resolved']] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
      }}
    ]);

    const statsMap = {};
    stats.forEach(s => { statsMap[s._id.toString()] = s; });
    const staffStatsMap = {};
    staffStats.forEach(s => { staffStatsMap[s._id.toString()] = s; });

    const result = users.map(u => {
      const sm = u.role === 'staff' ? staffStatsMap : statsMap;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        total: sm[u._id.toString()]?.total || 0,
        resolved: sm[u._id.toString()]?.resolved || 0,
        pending: sm[u._id.toString()]?.pending || 0,
        inProgress: sm[u._id.toString()]?.inProgress || 0,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/staff — admin gets all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Allow 'admin' role directly for presentation purposes
    const allowedRole = role || 'user';
    user = new User({ name, email, password, role: allowedRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id || req.user.user?.id;
    let user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) return res.status(400).json({ message: 'Invalid email format' });
      const exists = await require('../models/User').findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already taken' });
      user.email = email;
    }
    if (name) user.name = name;
    if (password && password.length >= 8) {
      user.password = password;
    } else if (password) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey_12345', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
