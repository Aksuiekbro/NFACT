import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Snackbar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { getPosts, updatePost, deletePost } from '../api/postApi'; // Import API helpers
import { likePost, addComment } from '../api/postApi'; // Import like/comment API helpers
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm'; // Import CreatePostForm
import EditPostModal from '../components/EditPostModal'; // Import EditPostModal

function FeedPage() {
  const { user, token, loading: authLoading, logout } = useAuth(); // Get user, token, auth loading state, and logout function
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Page-specific loading state
  const [error, setError] = useState(null);

  // State for Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  // State for Delete Confirmation Dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete

  // State for Snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  // --- Snackbar Handler ---
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // --- Fetch Posts ---
  const fetchPosts = useCallback(async (authToken) => {
    if (!authToken) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return; // Don't attempt fetch without token
    }
    console.log("FeedPage: Fetching posts with token...");
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await getPosts(authToken); // Pass token to API call
      console.log('FeedPage: API Response Data:', fetchedPosts);
      // Ensure posts are sorted newest first if backend doesn't guarantee order
      const sortedPosts = fetchedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedPosts);
    } catch (err) {
      console.error("FeedPage: Error fetching posts:", err);
      const errorMessage = err.message || 'Failed to load posts.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Handle 401 Unauthorized specifically
      if (errorMessage.includes('Unauthorized') || err.response?.status === 401) {
          console.log("FeedPage: Unauthorized access detected. Logging out.");
          logout(); // Call logout function from AuthContext
          // Optionally navigate to login page here if needed
      }
    } finally {
      setLoading(false);
    }
  }, [logout]); // Add logout to dependency array

  useEffect(() => {
    // Only fetch posts if authentication is not loading and token exists
    if (!authLoading && token) {
        fetchPosts(token);
    } else if (!authLoading && !token) {
        // If auth check is done and there's no token, clear posts and set appropriate message
        setPosts([]);
        setLoading(false);
        setError("Please log in to see the feed.");
    }
    // Dependency array includes token and authLoading to re-run when auth state changes
  }, [token, authLoading, fetchPosts]);

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (post) => {
    console.log("Opening edit modal for post:", post);
    setPostToEdit(post);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setPostToEdit(null); // Clear post data when closing
  };

  // --- CRUD Handlers ---
  const handleUpdatePost = async (postId, updatedData) => {
    if (!token) {
      showSnackbar('Authentication token not found. Please log in.', 'error');
      throw new Error('Authentication token not found.'); // Throw error to stop modal saving state
    }
    console.log(`Attempting to update post ${postId} with data:`, updatedData);
    try {
      const updatedPost = await updatePost(postId, updatedData, token);
      console.log("Post updated successfully:", updatedPost);
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(p => (p._id === postId ? { ...p, ...updatedPost } : p)) // Merge updates
      );
      handleCloseEditModal(); // Close modal on success
      showSnackbar('Post updated successfully!', 'success');
    } catch (err) {
      console.error("Error updating post:", err);
      showSnackbar(err.message || 'Failed to update post.', 'error');
      throw err; // Re-throw error so modal knows it failed
    }
  };

  const handleDeletePost = (postId) => {
    console.log(`Opening delete confirmation for post ${postId}`);
    setPostToDeleteId(postId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDeleteId || !token) {
        showSnackbar('Cannot delete post: Missing ID or authentication.', 'error');
        setDeleteConfirmOpen(false);
        setPostToDeleteId(null);
        return;
    }
    setIsDeleting(true);
    console.log(`Confirming delete for post ${postToDeleteId}`);
    try {
        await deletePost(postToDeleteId, token);
        console.log(`Post ${postToDeleteId} deleted successfully.`);
        // Update local state
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postToDeleteId));
        showSnackbar('Post deleted successfully!', 'success');
    } catch (err) {
        console.error("Error deleting post:", err);
        showSnackbar(err.message || 'Failed to delete post.', 'error');
    } finally {
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setPostToDeleteId(null);
    }
  };

  // Handler to be passed to CreatePostForm
  const handleRefreshPosts = () => {
    fetchPosts(); // Simply refetch all posts
  };
// --- Like/Comment Handlers ---
  const handleLike = async (postId) => {
    if (!token) {
      showSnackbar('You must be logged in to like posts.', 'error');
      return;
    }
    try {
      // Optimistic UI Update
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p._id === postId) {
            const isAlreadyLiked = p.likes.includes(user._id);
            const newLikes = isAlreadyLiked
              ? p.likes.filter(id => id !== user._id) // Unlike
              : [...p.likes, user._id]; // Like
            return { ...p, likes: newLikes };
          }
          return p;
        })
      );
      // Call API
      await likePost(postId, token);
      // No need to refetch all posts, optimistic update is usually sufficient for likes
    } catch (err) {
      console.error("Error liking post:", err);
      showSnackbar(err.message || 'Failed to update like status.', 'error');
      // Revert optimistic update on error (optional but recommended)
      fetchPosts(token); // Refetch to be sure state is correct
    }
  };

  const handleComment = async (postId, commentData) => {
     if (!token) {
      showSnackbar('You must be logged in to comment.', 'error');
      return;
    }
     if (!commentData || !commentData.text || !commentData.text.trim()) {
         showSnackbar('Comment text cannot be empty.', 'warning');
         return;
     }
    try {
      // Call API - backend should return the updated post with the new comment
      const updatedPost = await addComment(postId, commentData, token);

      // Update local state with the post returned from the API
      setPosts(prevPosts =>
        prevPosts.map(p => (p._id === postId ? updatedPost : p))
      );
      // Optionally show success snackbar
      // showSnackbar('Comment added!', 'success');
    } catch (err) {
      console.error("Error adding comment:", err);
      showSnackbar(err.message || 'Failed to add comment.', 'error');
    }
  };

  // --- Render Logic ---
  // Show loading indicator while auth is loading OR page is loading initially
  if (authLoading || (loading && posts.length === 0)) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{authLoading ? 'Checking authentication...' : 'Loading posts...'}</Typography>
      </Box>
  );

  // Show general error if fetch failed initially
  if (error && posts.length === 0) return (
      <Box sx={{ padding: 2, maxWidth: 600, margin: 'auto', textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
      </Box>
  );


  console.log('FeedPage: Rendering with state:', { posts: posts.length, loading, error: error, editModalOpen, postToEdit: postToEdit?._id });
  return (
    <Box sx={{ padding: { xs: 1, sm: 2 }, maxWidth: 700, margin: 'auto' }}> {/* Responsive padding */}
      <Typography variant="h4" gutterBottom align="center" sx={{ my: 2 }}>
        Bailanysta Feed
      </Typography>

      {/* Conditionally render CreatePostForm if logged in */}
      {user && token && ( // Use user from useAuth()
        <CreatePostForm onPostCreated={() => fetchPosts(token)} /> // Refresh by calling fetchPosts with token
      )}

      {/* Display loading indicator during refetch */}
      {loading && posts.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 1 }}>Refreshing posts...</Typography>
          </Box>
      )}

      {/* Display error during refetch */}
       {error && posts.length > 0 && (
           <Alert severity="warning" sx={{ my: 2 }}>{error} Displaying cached posts.</Alert>
       )}


      {/* Display Posts or "No Posts" message */}
      {!loading && posts.length === 0 ? (
         <Typography align="center" sx={{ mt: 4 }}>No posts yet! {user ? 'Be the first to share or follow others.' : 'Log in to see posts.'}</Typography>
      ) : (
         posts.map((post) => (
           <PostCard
             key={post._id}
             post={post} // Pass the whole post object
             // Pass handlers for edit/delete
             onEditClick={handleOpenEditModal}
             onDeleteClick={handleDeletePost}
             // Pass like/comment handlers and data
             onLike={handleLike}
             onComment={handleComment}
             likes={post.likes} // Pass likes array
             comments={post.comments} // Pass comments array
           />
         ))
      )}

      {/* Edit Post Modal */}
      {postToEdit && ( // Render modal only when there's a post to edit
          <EditPostModal
              open={editModalOpen}
              onClose={handleCloseEditModal}
              post={postToEdit}
              onUpdate={handleUpdatePost}
          />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
           {isDeleting && ( // Show progress inside dialog
               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                   <CircularProgress size={24} />
                   <Typography sx={{ ml: 1 }}>Deleting...</Typography>
               </Box>
           )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDeletePost} color="error" autoFocus disabled={isDeleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}

export default FeedPage;