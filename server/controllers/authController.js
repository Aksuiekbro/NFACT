const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Respond (don't send back password)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error('Registration Error:', error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  // Accept 'identifier' which can be email or username
  const { identifier, password } = req.body;

  // Basic validation
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please provide email/username and password' });
  }

  try {
    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      // Keep the message generic for security
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Use 401 for security
    }

    // User matched, create JWT
    const payload = {
      user: {
        id: user._id,
        // You can add more non-sensitive info here if needed
        // username: user.username
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send token to client
      }
    );

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Verify token and get user data
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // req.user.id should be attached by the protect middleware
    if (!req.user || !req.user.id) {
      // This case should technically be handled by 'protect' middleware sending 401
      // but adding a check here for robustness.
      return res.status(401).json({ message: 'Not authorized, user ID missing after token verification' });
    }

    // Fetch user details from DB, excluding the password
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      // This could happen if the user was deleted after the token was issued
      return res.status(404).json({ message: 'User not found' });
    }

    // Send back user data
    res.json(user);

  } catch (error) {
    console.error('Token Verification/User Fetch Error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
};
module.exports = {
  register,
  login,
  verifyToken, // Added verifyToken export here
};