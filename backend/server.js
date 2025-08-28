const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oms1';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('💡 Tip: Make sure MongoDB is running or check your connection string');
});

// Get connection state
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB error:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Simple User Schema (add this before routes)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Hello from backend!',
    database: db.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get all users (now from MongoDB)
app.get('/api/users', async (req, res) => {
  try {
    // Try to get users from MongoDB
    const users = await User.find();
    
    // If no users in DB, return sample data
    if (users.length === 0) {
      return res.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newUser = new User({ name, email });
    const savedUser = await newUser.save();
    
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db.readyState === 1 ? 'Connected' : 'Disconnected',
    server: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 MongoDB connection state: ${db.readyState}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});