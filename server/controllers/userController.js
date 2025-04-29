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

        // Return public profile data including the actual follower/following arrays
        res.json({
            _id: user._id,
            username: user.username,
            followers: user.followers, // Return the array
            following: user.following, // Return the array
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

        // Use atomic operations for updates
        const updateCurrentUser = await User.updateOne(
            { _id: currentUserId, following: { $ne: targetUserId } }, // Condition: only update if not already following
            { $addToSet: { following: targetUserId } }
        );

        const updateTargetUser = await User.updateOne(
            { _id: targetUserId, followers: { $ne: currentUserId } }, // Condition: only update if not already followed
            { $addToSet: { followers: currentUserId } }
        );

        // Check if updates actually modified documents (nModified > 0)
        // This indicates if the follow relationship was newly established
        // if (updateCurrentUser.modifiedCount > 0 || updateTargetUser.modifiedCount > 0) {
             // Optionally: Trigger notification logic here if needed
        // }

        // Return simple success status. Frontend should refetch profile data.
        res.status(200).json({ success: true, message: `Follow status updated for ${targetUser.username}` });

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

        // Use atomic operations for updates
        const updateCurrentUser = await User.updateOne(
            { _id: currentUserId },
            { $pull: { following: targetUserId } }
        );

        let updateTargetUser = null;
        if (targetUser) {
            updateTargetUser = await User.updateOne(
                { _id: targetUserId },
                { $pull: { followers: currentUserId } }
            );
        }

        // Log whether updates occurred (Optional)
        // if (updateCurrentUser.modifiedCount > 0) {
        //      console.log(`[unfollowUser] User ${currentUserId} unfollowed ${targetUserId}`);
        // }
        // if (updateTargetUser && updateTargetUser.modifiedCount > 0) {
        //      console.log(`[unfollowUser] User ${currentUserId} removed from ${targetUserId}'s followers`);
        // }

        // Return simple success status. Frontend should refetch profile data.
        res.status(200).json({ success: true, message: `Unfollow status updated for user ${targetUserId}` });

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