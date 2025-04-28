import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend URL is different

// Get user profile by identifier (username or ID)
export const getUserProfile = async (identifier) => {
    try {
        const response = await axios.get(`${API_URL}/users/profile/${identifier}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error.response?.data?.message || error.message);
        throw error;
    }
};

// Follow a user
export const followUser = async (userIdToFollow, token) => {
    try {
        const response = await axios.post(`${API_URL}/users/follow/${userIdToFollow}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error following user:', error.response?.data?.message || error.message);
        throw error;
    }
};

// Unfollow a user
export const unfollowUser = async (userIdToUnfollow, token) => {
    try {
        const response = await axios.post(`${API_URL}/users/unfollow/${userIdToUnfollow}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error unfollowing user:', error.response?.data?.message || error.message);
        throw error;
    }
};