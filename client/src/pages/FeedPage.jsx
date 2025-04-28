import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import PostCard from '../components/PostCard';

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = "tempUser123"; // Placeholder for logged-in user ID/Name

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/posts');
console.log('API Response Data:', response.data); // <-- Add this log
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Function to handle liking/unliking a post
  const handleLike = async (postId) => {
    try {
      // Send request to backend
      const response = await axios.patch(`/api/posts/${postId}/like`, { userId: currentUser });
      const updatedPost = response.data;

      // Update the posts state locally
      setPosts(posts.map(post => post._id === postId ? updatedPost : post));
    } catch (err) {
      console.error("Error liking post:", err);
      // Optionally show an error message to the user
    }
  };

  // Function to handle adding a comment
  const handleComment = async (postId, commentData) => {
    try {
      // Send request to backend
      const response = await axios.post(`/api/posts/${postId}/comment`, commentData);
      const updatedPost = response.data;

      // Update the posts state locally
      setPosts(posts.map(post => post._id === postId ? updatedPost : post));
    } catch (err) {
      console.error("Error adding comment:", err);
      // Optionally show an error message to the user
    }
  };


  if (loading) return <Typography sx={{ padding: 2 }}>Loading posts...</Typography>;
  if (error) return <Typography color="error" sx={{ padding: 2 }}>{error}</Typography>;

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: 'auto' }}> {/* Center content */}
      <Typography variant="h4" gutterBottom align="center"> {/* Center title */}
        Bailanysta Feed
      </Typography>

      {posts.length === 0 ? (
         <Typography align="center">No posts yet! Be the first to share.</Typography>
      ) : (
         posts.map((post) => (
           <PostCard
             key={post._id}
             postId={post._id} // Pass postId
             authorName={post.authorName}
             authorInitial={post.authorName ? post.authorName[0].toUpperCase() : '?'}
             postContent={post.content}
             timestamp={post.timestamp}
             likes={post.likes} // Pass likes
             comments={post.comments} // Pass comments
             onLike={handleLike} // Pass like handler
             onComment={handleComment} // Pass comment handler
             currentUser={currentUser} // Pass current user (for like status)
           />
         ))
      )}
    </Box>
  );
}

export default FeedPage;