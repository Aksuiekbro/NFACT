const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const postRoutes = require('./routes/postRoutes'); // Import post routes
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes

dotenv.config(); // Load environment variables from .env file

// Function to connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001; // Use environment variable or default
// Middleware
// Define CORS options
const allowedOrigins = [
    'http://localhost:5173',        // Local development frontend
    'https://nfact-lac.vercel.app'  // Deployed frontend on Vercel
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));
// Handle preflight requests for all routes

app.use(express.json()); // Parse JSON request bodies


// Mount routers
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/notifications', notificationRoutes); // Mount notification routes

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});
// Basic route for testing
app.get('/', (req, res) => {
  res.send('Bailanysta Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});