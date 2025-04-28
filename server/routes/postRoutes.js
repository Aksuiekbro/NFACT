const express = require('express');
const { getPosts, createPost, likePost, addComment } = require('../controllers/postController');

const router = express.Router();

// Define routes for /api/posts
router.route('/')
  .get(getPosts)    // GET /api/posts - Fetches all posts
  .post(createPost); // POST /api/posts - Creates a new post

// Route for liking/unliking a post
router.route('/:id/like')
  .patch(likePost); // PATCH /api/posts/:id/like - Likes/unlikes a post

// Route for adding a comment to a post
router.route('/:id/comment')
  .post(addComment); // POST /api/posts/:id/comment - Adds a comment

module.exports = router;