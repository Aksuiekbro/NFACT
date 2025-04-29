import React, { useState, useContext } from 'react'; // Import useContext
import { Link } from 'react-router-dom'; // Import Link
import {
  Card, CardContent, Typography, CardHeader, Avatar, CardActions, IconButton,
  Box, Collapse, TextField, Button, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import { useAuth } from '../context/AuthContext'; // Import useAuth hook instead

// Accept post object, onEditClick, onDeleteClick props
// Keep like/comment props for now, though they might be removed later if not used
function PostCard({ post, onEditClick, onDeleteClick, onLike, onComment, likes = [], comments = [] }) {
  const { user, token } = useAuth(); // Use the hook and get user/token
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Determine if the current user is the author
  // Use optional chaining for safety - compare user._id now
  const isOwner = user?._id === post?.author?._id;

  // --- Existing like/comment handlers (can be kept or removed) ---
  const handleCommentToggle = () => setShowComments(!showComments);
  const handleLikeClick = () => onLike && onLike(post._id);
  const handleCommentSubmit = () => {
    // Use user.username for authorName
    if (onComment && newCommentText.trim() && user) {
      onComment(post._id, { authorName: user.username, text: newCommentText });
      setNewCommentText('');
    }
  };
  // Check based on user._id
  const isLiked = user && likes.map(id => id.toString()).includes(user._id.toString());
  // --- End of like/comment handlers ---

  // Handlers for Edit/Delete buttons
  const handleEdit = () => {
    if (onEditClick) {
      onEditClick(post); // Pass the full post object
    }
  };

  const handleDelete = () => {
    if (onDeleteClick) {
      onDeleteClick(post._id); // Pass only the post ID
    }
  };


  // Defensive check for post object
  if (!post || !post.author) {
    return <Card sx={{ mb: 2 }}><CardContent><Typography>Error loading post.</Typography></CardContent></Card>;
  }

  return (
    <Card sx={{ mb: 2 }} elevation={2}>
      <CardHeader
        avatar={
          // Use first letter of username for avatar
          <Avatar sx={{ bgcolor: red[500] }} aria-label="author initial">
            {post.author.username ? post.author.username[0].toUpperCase() : '?'}
          </Avatar>
        }
        // Display author's username
        title={
          <Link
            to={`/profile/${post.author._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }} // Basic link styling
          >
            {post.author.username || 'Unknown User'}
          </Link>
        }
        // Display post creation date
        subheader={post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}
        // Action buttons (Edit/Delete) appear here if user is owner
        action={
          isOwner && (
            <Box>
              <IconButton aria-label="edit" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="delete" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )
        }
      />
      <CardContent sx={{ pt: 0 }}> {/* Reduce top padding */}
         {/* Display Post Title */}
         <Typography variant="h6" component="div" gutterBottom>
           {post.title || 'Untitled Post'}
         </Typography>
         {/* Display Post Body */}
        <Typography variant="body1" color="text.primary">
          {post.content || 'No content'} {/* Use post.content instead of post.body */}
        </Typography>
      </CardContent>
      {/* Keep Like/Comment actions if needed */}
      <CardActions disableSpacing sx={{ pt: 0, justifyContent: 'flex-start' }}>
        {/* Disable button if user is not logged in */}
        <IconButton aria-label="add to favorites" onClick={handleLikeClick} disabled={!user}>
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 1 }}>{likes.length}</Typography>

        <IconButton aria-label="show comments" onClick={handleCommentToggle}>
          <ChatBubbleOutlineIcon />
        </IconButton>
         <Typography variant="body2">{comments.length}</Typography>
      </CardActions>
      {/* Keep Comment Collapse section if needed */}
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
           <Divider sx={{ mb: 1 }}/>
           <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
            {comments.length > 0 ? comments.map((comment, index) => (
              <ListItem key={index} disableGutters>
                <ListItemText
                  primary={comment.text}
                  secondary={`${comment.authorName || 'Anon'} - ${comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString() : ''}`}
                />
              </ListItem>
            )) : (
              <ListItem>
                <ListItemText primary="No comments yet." />
              </ListItem>
            )}
          </List>
          {user && ( // Only show comment input if logged in
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TextField
                label="Add a comment..."
                variant="outlined"
                size="small"
                fullWidth
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button variant="contained" size="small" onClick={handleCommentSubmit}>
                Post
              </Button>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default PostCard;