const express = require('express');
const { register, login, verifyToken } = require('../controllers/authController'); // Added verifyToken
const { protect } = require('../middleware/authMiddleware'); // Added protect middleware
// Optional: Add input validation middleware like express-validator here
// const { check, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', /* Optional validation middleware array here */ register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', /* Optional validation middleware array here */ login);

// @route   GET api/auth/verify
// @desc    Verify token and get current user data
// @access  Private
router.get('/verify', protect, verifyToken);

module.exports = router;