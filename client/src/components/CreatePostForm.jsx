import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material'; // Import Paper and Alert
import { createPost } from '../api/postApi'; // Import the API helper
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

// Accept onPostCreated prop
function CreatePostForm({ onPostCreated }) {
  const [title, setTitle] = useState(''); // Add title state
  const [body, setBody] = useState(''); // Rename postContent to body
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false); // State for success message

  const { token } = useContext(AuthContext); // Get token from context

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setSubmitError('You must be logged in to create a post.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false); // Reset success message

    try {
      // Send both 'title' and 'content' fields
      const postData = { title: title, content: body }; // Include title and use 'content' for body
      console.log('Submitting post:', postData); // Will now log {title: "...", content: "..."}
      // Use the createPost helper with token
      const response = await createPost(postData, token);
      console.log('Post created successfully:', response);
      setTitle(''); // Clear title
      setBody(''); // Clear body
      setSubmitSuccess(true); // Show success message
      if (onPostCreated) {
        onPostCreated(); // Call the refresh function passed from parent
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setSubmitError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Create New Post
        </Typography>
        {/* Add Title Field */}
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          disabled={isSubmitting}
        />
        <TextField
          label="What's on your mind?" // Keep label descriptive
          multiline
          rows={4}
          fullWidth
          value={body} // Use body state
          onChange={(e) => setBody(e.target.value)} // Update body state
          margin="normal"
          required
          disabled={isSubmitting}
        />
        {/* Display submission error */}
        {submitError && <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>}
        {/* Display success message */}
        {submitSuccess && <Alert severity="success" sx={{ mt: 1 }}>Post created successfully!</Alert>}
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }} // Add more margin top
          disabled={isSubmitting || !title.trim() || !body.trim()} // Disable if no title/body or submitting
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </Box>
    </Paper>
  );
}

export default CreatePostForm;