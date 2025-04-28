const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster querying by recipient
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment'],
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true, // Index for faster querying of unread notifications
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add an index on recipient and createdAt for efficient fetching and sorting
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);