const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Assuming the middleware export is named 'protect'

// Apply auth middleware to all notification routes
router.use(protect);

// GET /api/notifications - Fetch notifications for the logged-in user
router.get('/', getNotifications);

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', markAsRead);

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', markAllAsRead);

module.exports = router;