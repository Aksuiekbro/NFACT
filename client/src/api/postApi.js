// client/src/api/postApi.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend URL is different

// Helper to get headers with Authorization token
const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

// Fetch all posts (now requires authentication)
export const getPosts = async (token) => {
    const response = await fetch(`${API_URL}/posts`, {
        headers: getAuthHeaders(token), // Use the helper to add auth header
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch potential JSON parsing errors
        // Specifically check for 401 Unauthorized
        if (response.status === 401) {
            throw new Error(errorData.message || 'Unauthorized: Please log in again.');
        }
        throw new Error(errorData.message || 'Failed to fetch posts');
    }
    return response.json();
};

// Create a new post
export const createPost = async (postData, token) => {
    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(postData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
    }
    return response.json();
};

// Update an existing post
export const updatePost = async (postId, postData, token) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(postData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
    }
    return response.json();
};

// Delete a post
export const deletePost = async (postId, token) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        // Try to parse error message, provide default if fails
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete post' }));
        throw new Error(errorData.message || 'Failed to delete post');
    }
     // Check for 204 No Content or other success statuses
    if (response.status === 204 || response.ok) {
         // Return a success indicator or the response if backend sends one
        return { message: 'Post deleted successfully' };
    }
    // Handle unexpected success statuses if necessary
    const responseData = await response.json().catch(() => ({})); // Avoid error if body is empty
    throw new Error(responseData.message || 'An unexpected error occurred during deletion');
};
// Fetch posts for a specific user
export const getUserPosts = async (userId, token) => {
    // Construct headers - might need auth depending on backend route protection
    const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' };
    const response = await fetch(`${API_URL}/posts/user/${userId}`, {
        headers: headers,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch posts for user ${userId}`);
    }
    return response.json();
};
// Like/Unlike a post
export const likePost = async (postId, token) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'PATCH', // Use PATCH as defined in backend routes
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update like status');
    }
    return response.json(); // Backend returns the updated post
};
// Add a comment to a post
export const addComment = async (postId, commentData, token) => {
    // commentData should be an object like { text: "..." }
    const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(commentData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add comment');
    }
    return response.json(); // Backend returns the updated post with comments
};