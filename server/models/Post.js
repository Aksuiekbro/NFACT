const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Please add post content'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: [String], // Array of user IDs (assuming string IDs for now)
    default: [],
  },
  comments: {
    type: [CommentSchema], // Array of comment subdocuments
    default: [],
  },
});

module.exports = mongoose.model('Post', PostSchema);