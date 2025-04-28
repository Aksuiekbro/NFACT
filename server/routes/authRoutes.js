const express = require('express');
const { register, login } = require('../controllers/authController');
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

module.exports = router;