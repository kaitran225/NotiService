// Set NODE_ENV to production if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const express = require('express');
const { port } = require('./config');
const { testConnection } = require('./db');
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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