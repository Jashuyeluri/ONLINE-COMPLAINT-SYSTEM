const Query = require('../models/Query');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/queries — user creates a new query
const createQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const query = await Query.create({
      subject,
      message,
      createdBy: req.user.id
    });

    // Notify all admins about the new query
    const admins = await User.find({ role: 'admin' });
    const user = await User.findById(req.user.id);
    await Notification.insertMany(
      admins.map(admin => ({
        recipient: admin._id,
        type: 'new_complaint',
        message: `New query from ${user.name}: "${subject}"`
      }))
    );

    const populated = await Query.findById(query._id)
      .populate('createdBy', 'name email')
      .populate('replies.repliedBy', 'name email role');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/queries — users see theirs, admins see all
const getQueries = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    const queries = await Query.find(filter)
      .populate('createdBy', 'name email')
      .populate('replies.repliedBy', 'name email role')
      .sort({ updatedAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/queries/:id — single query
const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('replies.repliedBy', 'name email role');
    if (!query) return res.status(404).json({ message: 'Query not found' });

    // Only owner or admin can view
    if (req.user.role !== 'admin' && query.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/queries/:id/reply — admin or query owner can reply
const replyToQuery = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Reply message is required' });

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });

    // Only admin or the query owner can reply
    if (req.user.role !== 'admin' && query.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Enforcement: Admin can only reply once to a user's query
    if (req.user.role === 'admin') {
      const hasAdminReplied = query.replies.some(r => r.repliedBy.toString() === req.user.id);
      if (hasAdminReplied) {
        return res.status(403).json({ message: 'Admins are restricted to a single reply per query.' });
      }
    }

    query.replies.push({ message, repliedBy: req.user.id });

    // If admin replies, mark as Answered and notify user
    if (req.user.role === 'admin') {
      query.status = 'Answered';
      await Notification.create({
        recipient: query.createdBy,
        type: 'status_update',
        message: `Admin replied to your query: "${query.subject}"`
      });
    } else {
      // If user replies to an answered query, re-open it
      if (query.status === 'Answered' || query.status === 'Closed') {
        query.status = 'Open';
      }
      // Notify admins about user follow-up
      const admins = await User.find({ role: 'admin' });
      const user = await User.findById(req.user.id);
      await Notification.insertMany(
        admins.map(admin => ({
          recipient: admin._id,
          type: 'new_complaint',
          message: `${user.name} replied to query: "${query.subject}"`
        }))
      );
    }

    await query.save();

    const populated = await Query.findById(query._id)
      .populate('createdBy', 'name email')
      .populate('replies.repliedBy', 'name email role');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/queries/:id/close — admin closes a query
const closeQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });

    query.status = 'Closed';
    await query.save();

    await Notification.create({
      recipient: query.createdBy,
      type: 'status_update',
      message: `Your query "${query.subject}" has been closed by admin`
    });

    const populated = await Query.findById(query._id)
      .populate('createdBy', 'name email')
      .populate('replies.repliedBy', 'name email role');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createQuery, getQueries, getQueryById, replyToQuery, closeQuery };
