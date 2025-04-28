import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material'; // Import Paper
import axios from 'axios'; // Import axios

function CreatePostForm() {
  const [postContent, setPostContent] = useState('');
  // Optional: Add state for loading/error feedback
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // setIsSubmitting(true); // Optional: Set loading state
    // setSubmitError(null); // Optional: Clear previous errors

    try {
      console.log('Submitting post:', postContent);
      const response = await axios.post('/api/posts', {
        authorName: 'CurrentUser', // Hardcoded as per instructions
        content: postContent,
      });
      console.log('Post created successfully:', response.data);
      setPostContent(''); // Clear form after successful submit
    } catch (err) {
      console.error('Error creating post:', err);
      // setSubmitError('Failed to create post. Please try again.'); // Optional: Set error message
    } finally {
      // setIsSubmitting(false); // Optional: Reset loading state
    }
  };

  return (
    // Wrap form in Paper with padding and elevation
    <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
      <Box component="form" onSubmit={handleSubmit}> {/* Remove sx from Box */}
        <Typography variant="h6" gutterBottom> {/* Add gutterBottom */}
          Create New Post
        </Typography>
        <TextField
          label="What's on your mind?"
          multiline
        rows={4}
        fullWidth
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        margin="normal"
        required
        // disabled={isSubmitting} // Optional: Disable while submitting
      />
      {/* Optional: Display submission error */}
      {/* {submitError && <Typography color="error">{submitError}</Typography>} */}
      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 1 }}
        // disabled={isSubmitting || !postContent.trim()} // Optional: Disable button
      >
        {/* {isSubmitting ? 'Posting...' : 'Post'} */}
        Post
      </Button>
      </Box>
    </Paper>
  );
}

export default CreatePostForm;