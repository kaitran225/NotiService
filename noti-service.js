#!/usr/bin/env node

// Set production mode
process.env.NODE_ENV = 'production';

// Memory optimization
Buffer.poolSize = 4 * 1024; // 4KB

// Minimal imports
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Config from environment variables
const config = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET,
  springBootUrl: process.env.SPRING_SERVICE_URL || 'http://backend.railway.internal',
  db: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DEFAULT,
    port: parseInt(process.env.DATABASE_PORT),
    connectionLimit: 2,
    queueLimit: 5,
    enableKeepAlive: false,
    dateStrings: true
  }
};

// Create DB pool
const pool = mysql.createPool(config.db);

// Create Express app
const app = express();
app.use(express.json());

// JWT verification middleware
const auth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({e:'No token'});
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      uid: decoded.uid || decoded.sub,
      MANAGER: decoded.role === 'ROLE_MANAGER' || decoded.role?.includes('MANAGER')
    };
    next();
  } catch (e) {
    res.status(403).json({e:'Invalid token'});
  }
};

// Health check endpoint
app.get('/health', (_, res) => res.json({ status: 'UP' }));

// Redirect read/unread endpoints to Spring Boot service
app.post('/api/notifications/:notificationId/read', (req, res) => {
  res.redirect(307, `${config.springBootUrl}/api/notifications/${req.params.notificationId}/read${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
});

app.get('/api/notifications/read', (req, res) => {
  res.redirect(`${config.springBootUrl}/api/notifications/read${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
});

app.get('/api/notifications/unread', (req, res) => {
  res.redirect(`${config.springBootUrl}/api/notifications/unread${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
});

// Main notifications endpoint
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const tokenUid = req.user.uid;
    if (!tokenUid) return res.status(400).json({e:'No uid'});
    
    const requestedUserId = req.query.userId;
    const finalUserId = requestedUserId || tokenUid;
    
    if (requestedUserId && requestedUserId !== tokenUid) {
      if (!req.user.MANAGER) return res.status(403).json({e:'Not authorized'});
    }
    
    const [notifications] = await pool.query(
      'SELECT NotificationID as id, Title as title, Message as message, Type as type, IsRead as isRead, CreatedAt as createdAt, UserID as userID FROM Notifications WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 20',
      [finalUserId]
    );
    
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      isRead: Boolean(notification.isRead),
      userID: notification.userID
    }));
    
    res.json(formattedNotifications);
  } catch (e) {
    res.status(500).json({e:'Query failed'});
  }
});

// Start server
async function start() {
  try {
    // Test connection
    const conn = await pool.getConnection();
    conn.release();
    
    // Start server
    const PORT = process.env.PORT || config.port;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Running on ${PORT}`);
      console.log(`Spring Boot service URL: ${config.springBootUrl}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => process.exit(0));
  } catch (e) {
    console.error('Startup error:', e);
    process.exit(1);
  }
}

// Run the server
start(); 