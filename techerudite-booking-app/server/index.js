const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Handle MongoDB connection issues gracefully
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Running in development mode with limited functionality');
    return false;
  }
};

// Handle uncaught promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Don't crash the server, just log the error
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';
  res.status(statusCode).json({ message });
});

// Start the server regardless of MongoDB connection status
const startServer = async () => {
  // Try to connect to MongoDB but proceed even if it fails
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer(); 