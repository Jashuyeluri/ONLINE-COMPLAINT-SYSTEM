require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const staffStats = await Complaint.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: null } } },
      { $group: {
        _id: '$assignedTo',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['Completed', 'Resolved']] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
      }}
    ]);
    console.log("Output: ", JSON.stringify(staffStats, null, 2));
    process.exit(0);
  });
