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
// Configure CORS to allow requests from the Vercel frontend
app.use(cors({
  origin: 'https://nfact-lac.vercel.app', // Allow only your frontend origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allow common methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));
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