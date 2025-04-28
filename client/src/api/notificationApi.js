import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend URL is different

/**
 * Fetches notifications for the logged-in user.
 * @param {string} token - The JWT token for authorization.
 * @returns {Promise<Array>} - A promise that resolves to an array of notifications.
 */
export const getNotifications = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data?.message || error.message);
    throw error; // Re-throw to allow caller handling
  }
};

/**
 * Marks a specific notification as read.
 * @param {string} id - The ID of the notification to mark as read.
 * @param {string} token - The JWT token for authorization.
 * @returns {Promise<Object>} - A promise that resolves to the updated notification.
 */
export const markNotificationAsRead = async (id, token) => {
  try {
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Marks all notifications as read for the logged-in user.
 * @param {string} token - The JWT token for authorization.
 * @returns {Promise<Object>} - A promise that resolves to a confirmation message.
 */
export const markAllNotificationsAsRead = async (token) => {
  try {
    const response = await axios.patch(`${API_URL}/notifications/read-all`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error.response?.data?.message || error.message);
    throw error;
  }
};