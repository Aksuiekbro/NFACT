const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 }); // Sort newest first
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server Error fetching posts' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Public (for now)
const createPost = async (req, res) => {
  const { authorName, content } = req.body;

  if (!authorName || !content) {
     return res.status(400).json({ message: 'Author name and content are required' });
  }

  try {
    const newPost = await Post.create({
      authorName,
      content,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error creating post' });
  }
};

// @desc    Like/Unlike a post
// @route   PATCH /api/posts/:id/like
// @access  Private (needs user ID)
const likePost = async (req, res) => {
  const { userId } = req.body; // Assuming userId is sent in the request body
  const { id: postId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required to like/unlike a post' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // Not liked, add like
      post.likes.push(userId);
    } else {
      // Already liked, remove like (unlike)
      post.likes.splice(index, 1);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);

  } catch (error) {
    console.error('Error liking/unliking post:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }
    res.status(500).json({ message: 'Server Error liking/unliking post' });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Public (for now)
const addComment = async (req, res) => {
  const { authorName, text } = req.body;
  const { id: postId } = req.params;

  if (!authorName || !text) {
    return res.status(400).json({ message: 'Author name and comment text are required' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      authorName,
      text,
      // timestamp is added by default by Mongoose schema
    };

    post.comments.push(newComment);

    const updatedPost = await post.save();
    // Return the newly added comment or the whole post? Returning post for now.
    res.status(201).json(updatedPost);

  } catch (error) {
    console.error('Error adding comment:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
     if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }
    res.status(500).json({ message: 'Server Error adding comment' });
  }
};


module.exports = {
  getPosts,
  createPost,
  likePost,
  addComment,
};