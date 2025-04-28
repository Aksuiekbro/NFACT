// client/src/components/EditPostModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, CircularProgress, Alert, Typography
} from '@mui/material';

function EditPostModal({ open, onClose, post, onUpdate }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Effect to update form fields when the 'post' prop changes or modal opens/closes
  useEffect(() => {
    if (open && post) {
      setTitle(post.title || '');
      setBody(post.body || '');
      setError(null); // Clear previous errors when opening
      setIsSaving(false); // Ensure saving state is reset
    }
    // Optionally reset fields when closing if desired, prevents seeing old data briefly if reopened quickly
    // if (!open) {
    //   setTitle('');
    //   setBody('');
    //   setError(null);
    //   setIsSaving(false);
    // }
  }, [post, open]); // Depend on post and open status

  const handleSave = async () => {
    // Basic validation
    if (!title.trim() || !body.trim()) {
        setError("Title and body cannot be empty.");
        return;
    }
    if (!post?._id) {
        setError("Cannot save: Post ID is missing.");
        return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Call the update handler passed from the parent
      // The parent (FeedPage) is responsible for the actual API call
      await onUpdate(post._id, { title, body });
      // Parent component (FeedPage) should handle closing the modal on success via its own state management triggered by onUpdate finishing
      // No need to call onClose() here directly if parent handles it
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message || "Failed to save changes. Please try again.");
      setIsSaving(false); // Ensure loading state stops on error
    }
    // Do not set isSaving to false here if success, parent will close modal which resets state via useEffect
  };

  const handleCancel = () => {
    // Don't reset fields here, useEffect handles it based on 'open' prop
    onClose(); // Call the close handler from the parent
  };

  return (
    // Prevent closing by clicking outside if saving
    <Dialog open={open} onClose={isSaving ? undefined : handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        {/* Display error if any */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Show loading indicator while saving */}
        {isSaving && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Saving...</Typography>
          </Box>
        )}

        {/* Form Fields - Hide form during save to prevent interaction */}
        <Box component="form" noValidate autoComplete="off" sx={{ display: isSaving ? 'none' : 'block' }}>
           {/* Check if post data is available */}
           {post ? (
             <>
               <TextField
                 margin="dense"
                 id="title"
                 label="Title"
                 type="text"
                 fullWidth
                 variant="outlined"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 required
                 sx={{ mb: 2 }} // Add margin bottom
                 disabled={isSaving} // Disable field while saving
               />
               <TextField
                 margin="dense"
                 id="body"
                 label="Body"
                 type="text"
                 fullWidth
                 multiline
                 rows={4}
                 variant="outlined"
                 value={body}
                 onChange={(e) => setBody(e.target.value)}
                 required
                 disabled={isSaving} // Disable field while saving
               />
             </>
           ) : (
             // Show message if post data is missing (e.g., during initial load)
             <Typography>Loading post data...</Typography>
           )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isSaving}>Cancel</Button>
        <Button
            onClick={handleSave}
            variant="contained"
            // Disable button if saving, fields are empty, or no changes were made
            disabled={isSaving || !title.trim() || !body.trim() || (post && title === post.title && body === post.body)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPostModal;