const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const postRoutes = require('./routes/postRoutes'); // Import post routes

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
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Mount routers
app.use('/api/posts', postRoutes);

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