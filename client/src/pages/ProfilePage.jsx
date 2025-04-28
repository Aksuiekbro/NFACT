import React from 'react';
import { Box, Typography } from '@mui/material'; // Example MUI import
import CreatePostForm from '../components/CreatePostForm';

function ProfilePage() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        User Profile Page
      </Typography>
      {/* Placeholder for profile content */}
      <Typography>
        Profile details will go here.
      </Typography>
      <CreatePostForm />
    </Box>
  );
}

export default ProfilePage;