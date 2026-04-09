const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const querySchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

querySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Query', querySchema);
