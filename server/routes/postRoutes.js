const express = require('express');
const {
  getPosts,
  createPost,
  updatePost, // Import updatePost
  deletePost, // Import deletePost
  likePost,
  addComment,
  getUserPosts // Added getUserPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// --- Post Routes ---

// GET all posts (Public) /api/posts
// POST a new post (Protected) /api/posts
router.route('/')
  .get(protect, getPosts) // Apply protect middleware here
  .post(protect, createPost);

// PUT update a specific post (Protected) /api/posts/:id
// DELETE a specific post (Protected) /api/posts/:id
router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

// GET posts by a specific user /api/posts/user/:userId
router.get('/user/:userId', getUserPosts); // Added route for user-specific posts

// --- Like Routes --- (Keep as is for now, may need protection later)

// PATCH like/unlike a post /api/posts/:id/like (Protected)
router.route('/:id/like')
  .patch(protect, likePost); // Apply protect middleware

// --- Comment Routes --- (Keep as is for now, may need protection later)

// POST add a comment to a post /api/posts/:id/comment (Protected)
router.route('/:id/comment')
  .post(protect, addComment); // Apply protect middleware

module.exports = router;