const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get user profile by ID or username
// @route   GET /api/users/:identifier
// @access  Public
const getUserProfile = async (req, res) => {
    const { identifier } = req.params;
    let user;

    try {
        // Check if identifier is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier).select('-password -email'); // Exclude sensitive fields
        } else {
            // If not an ObjectId, assume it's a username
            user = await User.findOne({ username: identifier }).select('-password -email'); // Exclude sensitive fields
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return public profile data including follower/following counts
        res.json({
            _id: user._id,
            username: user.username,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            createdAt: user.createdAt,
            // Add any other public fields you want to expose
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};


// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id; // Assuming authMiddleware adds user to req

    if (targetUserId === currentUserId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    try {
        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add target user to current user's following list
        // Add current user to target user's followers list
        // Using $addToSet to prevent duplicates
        await currentUser.updateOne({ $addToSet: { following: targetUserId } });
        await targetUser.updateOne({ $addToSet: { followers: currentUserId } });

        // No need to save separately as updateOne saves changes

        res.json({ message: `Successfully followed ${targetUser.username}` });

    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Server error following user' });
    }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id; // Assuming authMiddleware adds user to req

    try {
        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            // It's okay if the target user doesn't exist, maybe they were deleted
            // But the current user must exist
            if (!currentUser) return res.status(404).json({ message: 'Current user not found' });
            // If only target user is not found, proceed to remove from current user's list if present
        }

        // Remove target user from current user's following list
        // Remove current user from target user's followers list (if target exists)
        await currentUser.updateOne({ $pull: { following: targetUserId } });
        if (targetUser) {
            await targetUser.updateOne({ $pull: { followers: currentUserId } });
        }

        res.json({ message: `Successfully unfollowed user` }); // Keep message generic in case target user was deleted

    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Server error unfollowing user' });
    }
};


module.exports = {
    getUserProfile,
    followUser,
    unfollowUser,
};