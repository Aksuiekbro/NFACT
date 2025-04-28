const express = require('express');
const {
  getPosts,
  createPost,
  updatePost, // Import updatePost
  deletePost, // Import deletePost
  likePost,
  addComment
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

// --- Like Routes --- (Keep as is for now, may need protection later)

// PATCH like/unlike a post /api/posts/:id/like
router.route('/:id/like')
  .patch(likePost);

// --- Comment Routes --- (Keep as is for now, may need protection later)

// POST add a comment to a post /api/posts/:id/comment
router.route('/:id/comment')
  .post(addComment);

module.exports = router;