// Set NODE_ENV to production if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Memory optimization
if (process.env.NODE_ENV === 'production') {
  // Force garbage collection when possible
  global.gc && global.gc();
}

// Limit buffer size
Buffer.poolSize = 8 * 1024; // 8KB

const express = require('express');
const { port } = require('./config');
const { testConnection } = require('./db');
const routes = require('./routes');

// Create Express app with minimal settings
const app = express();

// Minimal middleware
app.use(express.json({ limit: '10kb' }));

// Simple health check endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Register routes
app.use(routes);

// Minimal error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error' });
});

// Start the server with minimal memory footprint
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Use PORT from environment (Railway sets this)
    const PORT = process.env.PORT || port || 8080;
    
    // Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Server shutdown');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Server start failed');
    process.exit(1);
  }
}

startServer(); 