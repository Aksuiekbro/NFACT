const Post = require('../models/Post');
const User = require('../models/User'); // Import User model
const Notification = require('../models/Notification'); // Import Notification model

// @desc    Get global post feed
// @route   GET /api/posts
// @access  Private (Still requires login to view feed)
const getPosts = async (req, res) => {
  try {
    // Fetch all posts, regardless of author
    const posts = await Post.find({}) // Changed query to find all posts
      .populate('author', 'username') // Populate author's username
      .sort({ timestamp: -1 }); // Sort by timestamp field defined in schema, newest first

    res.status(200).json(posts);

  } catch (error) {
    console.error('Error fetching global feed:', error); // Updated error message context
    res.status(500).json({ message: 'Server Error fetching feed' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private (Requires Authentication)
const createPost = async (req, res) => {
  // Author ID comes from the authenticated user (set by authMiddleware)
  const { content } = req.body;
  const authorId = req.user.id; // Get user ID from middleware

  if (!content) {
     return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const newPost = await Post.create({
      content,
      author: authorId, // Assign the author ID
    });
    // Optionally populate author info in the response
    const populatedPost = await Post.findById(newPost._id).populate('author', 'username');
    res.status(201).json(populatedPost);
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
  const userId = req.user.id; // Get user ID from authenticated user
  const { id: postId } = req.params;

  try {
    const post = await Post.findById(postId).populate('author', '_id'); // Populate author ID

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const index = post.likes.indexOf(userId);
    let liked = false; // Flag to check if a like was added

    if (index === -1) {
      // Not liked, add like
      post.likes.push(userId);
      liked = true; // Mark that a like was added
    } else {
      // Already liked, remove like (unlike)
      post.likes.splice(index, 1);
    }

    const updatedPost = await post.save();

    // --- Notification Logic ---
    // Only send notification if a like was ADDED and the liker is not the post author
    if (liked && post.author && userId !== post.author._id.toString()) {
      try {
        await Notification.create({
          recipient: post.author._id,
          sender: userId,
          type: 'like',
          post: postId,
        });
        // console.log('Like notification created'); // Optional: for debugging
      } catch (notificationError) {
        console.error('Error creating like notification:', notificationError);
        // Don't block the main response if notification fails
      }
    }
    // --- End Notification Logic ---

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
  const { text } = req.body;
  const userId = req.user.id; // Get user ID from authenticated user
  const { id: postId } = req.params;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    // Fetch the commenting user's details to get their username
    const commentingUser = await User.findById(userId).select('username');
    if (!commentingUser) {
        return res.status(404).json({ message: 'Commenting user not found.' });
    }

    // Find the post (no need to populate author here, just need the post object)
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      authorName: commentingUser.username, // Use correct field name and username
      text,
      // timestamp is added by default by Mongoose schema
    };

    post.comments.push(newComment);

    const updatedPost = await post.save();

    // --- Notification Logic ---
    // Send notification if commenter is not the post author
    if (post.author && userId !== post.author._id.toString()) {
       try {
         await Notification.create({
           recipient: post.author._id,
           sender: userId,
           type: 'comment',
           post: postId,
         });
         // console.log('Comment notification created'); // Optional: for debugging
       } catch (notificationError) {
         console.error('Error creating comment notification:', notificationError);
         // Don't block the main response if notification fails
       }
    }
    // --- End Notification Logic ---

    // Populate comment author username for the response
    const populatedPost = await Post.findById(updatedPost._id)
        .populate('author', 'username');
        // No need to populate comments.author anymore as we store authorName directly

    res.status(201).json(populatedPost);

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


// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;
  const { content } = req.body; // Only allow updating content for now

  if (!content) {
    return res.status(400).json({ message: 'Content cannot be empty for update' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the logged-in user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this post' });
    }

    // Update the post content
    post.content = content;
    // You could add more updatable fields here if needed
    // post.someOtherField = req.body.someOtherField;

    const updatedPost = await post.save();
    // Populate author info in the response
    const populatedPost = await Post.findById(updatedPost._id).populate('author', 'username');

    res.status(200).json(populatedPost);

  } catch (error) {
    console.error('Error updating post:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }
    res.status(500).json({ message: 'Server Error updating post' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the logged-in user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne(); // Use deleteOne() or remove()

    res.status(200).json({ message: 'Post successfully deleted', postId: postId });

  } catch (error) {
    console.error('Error deleting post:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }
    res.status(500).json({ message: 'Server Error deleting post' });
  }
};

// @desc    Get all posts for a specific user
// @route   GET /api/posts/user/:userId
// @access  Public (or Private, depending on requirements)
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from route parameters

    // Validate if userId is a valid ObjectId format if needed, though find should handle it
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: 'Invalid User ID format' });
    // }

    const posts = await Post.find({ author: userId }) // Find posts by this specific author
      .populate('author', 'username') // Populate author's username
      .sort({ timestamp: -1 }); // Sort by timestamp, newest first

    // Check if user exists or if posts array is empty - return empty array if no posts found
    res.status(200).json(posts);

  } catch (error) {
    console.error(`Error fetching posts for user ${req.params.userId}:`, error);
     if (error.name === 'CastError') { // Handle potential CastError if ID format is wrong despite check
        return res.status(400).json({ message: 'Invalid User ID format provided' });
    }
    res.status(500).json({ message: 'Server Error fetching user posts' });
  }
};

module.exports = {
getUserPosts, // Added getUserPosts
  getPosts,
  createPost,
  updatePost, // Add updatePost
  deletePost, // Add deletePost
  likePost,   // Keep existing ones
  addComment, // Keep existing ones
};