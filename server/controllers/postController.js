const Post = require('../models/Post');
const User = require('../models/User'); // Import User model
const Notification = require('../models/Notification'); // Import Notification model

// @desc    Get personalized post feed for the logged-in user
// @route   GET /api/posts
// @access  Private (Requires Authentication)
const getPosts = async (req, res) => {
  try {
    // 1. Get the logged-in user's ID from the request (set by authMiddleware)
    const userId = req.user.id;

    // 2. Find the logged-in user to get their 'following' list
    const user = await User.findById(userId).select('following'); // Select only the 'following' field

    if (!user) {
      // This shouldn't happen if authMiddleware is working correctly, but good to check
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Create the list of authors to fetch posts from: the user themselves + people they follow
    const authorsToFetch = [...user.following, userId]; // Include user's own posts

    // 4. Find posts where the author is in the 'authorsToFetch' list
    const posts = await Post.find({ author: { $in: authorsToFetch } })
      .populate('author', 'username') // Populate author's username
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json(posts);

  } catch (error) {
    console.error('Error fetching personalized feed:', error);
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
    // Populate author ID to check for notification
    const post = await Post.findById(postId).populate('author', '_id');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: userId, // Store the user ID as the author
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
        .populate('author', 'username')
        .populate('comments.author', 'username'); // Populate author within comments

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


module.exports = {
  getPosts,
  createPost,
  updatePost, // Add updatePost
  deletePost, // Add deletePost
  likePost,   // Keep existing ones
  addComment, // Keep existing ones
};