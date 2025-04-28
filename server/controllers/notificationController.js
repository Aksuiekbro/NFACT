const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler'); // Assuming asyncHandler is used for error handling

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 }) // Sort by newest first
    .populate('sender', 'username') // Populate sender info, only username
    .populate('post', '_id') // Populate post info, only id
    .limit(20); // Limit the number of notifications

  res.status(200).json(notifications);
});

// @desc    Mark a specific notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if the notification belongs to the logged-in user
  if (notification.recipient.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to update this notification');
  }

  // Only update if it's not already read
  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  res.status(200).json(notification); // Return the updated notification
});

// @desc    Mark all unread notifications as read for the logged-in user
// @route   POST /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user.id, read: false }, // Find unread notifications for the user
    { $set: { read: true } } // Set them to read
  );

  res.status(200).json({ message: `Marked ${result.modifiedCount} notifications as read.` });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};