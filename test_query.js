const mongoose = require('mongoose');
const Complaint = require('./backend/models/Complaint');

mongoose.connect('mongodb://localhost:27017/complaint_db', { useNewUrlParser: true, useUnifiedTopology: true })
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
    console.log("staffStats", JSON.stringify(staffStats, null, 2));
    process.exit(0);
  });
