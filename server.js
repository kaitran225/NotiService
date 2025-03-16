// Set NODE_ENV to production if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const express = require('express');
const { port } = require('./config');
const { testConnection, initDb } = require('./db');
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Token verification test endpoint
app.get('/api/verify-token', require('./middleware').authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token is valid',
    user: req.user
  });
});

// Register routes
app.use(routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initDb();
    
    // Start listening
    app.listen(port, () => {
      console.log(`Notification service running on port ${port} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 