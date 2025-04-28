const express = require('express');
const {
    getUserProfile,
    followUser,
    unfollowUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Assuming protect is the name of the middleware export

const router = express.Router();

// Public route to get user profile
router.get('/:identifier', getUserProfile);

// Protected routes for following/unfollowing
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;