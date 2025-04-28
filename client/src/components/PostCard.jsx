import React, { useState } from 'react';
import {
  Card, CardContent, Typography, CardHeader, Avatar, CardActions, IconButton,
  Box, Collapse, TextField, Button, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// Added postId, likes, comments, onLike, onComment, currentUser (placeholder)
function PostCard({ postId, authorName, authorInitial, postContent, timestamp, likes = [], comments = [], onLike, onComment, currentUser = "tempUser123" }) {
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleLikeClick = () => {
    if (onLike) {
      onLike(postId); // Pass postId to the handler
    }
  };

  const handleCommentSubmit = () => {
    if (onComment && newCommentText.trim()) {
      // Assuming onComment needs postId and the comment details
      // In a real app, authorName for comment might come from logged-in user context
      onComment(postId, { authorName: currentUser, text: newCommentText });
      setNewCommentText(''); // Clear input after submit
      // Optionally keep comments open or close after submit
      // setShowComments(false);
    }
  };

  const isLiked = likes.includes(currentUser); // Check if the current user liked the post

  return (
    <Card sx={{ mb: 2 }} elevation={2}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="author initial">
            {authorInitial || '?'}
          </Avatar>
        }
        title={authorName || 'Unknown User'}
        subheader={timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
      />
      <CardContent>
        <Typography variant="body1" color="text.primary">
          {postContent || 'No content'}
        </Typography>
      </CardContent>
      <CardActions disableSpacing sx={{ pt: 0 }}> {/* Remove top padding */}
        <IconButton aria-label="add to favorites" onClick={handleLikeClick}>
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 1 }}>{likes.length}</Typography> {/* Display like count */}

        <IconButton aria-label="show comments" onClick={handleCommentToggle}>
          <ChatBubbleOutlineIcon />
        </IconButton>
         <Typography variant="body2">{comments.length}</Typography> {/* Display comment count */}
      </CardActions>
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}> {/* Remove top padding */}
           <Divider sx={{ mb: 1 }}/>
           <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}> {/* Limit height and enable scroll */}
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
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default PostCard;