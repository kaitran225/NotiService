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
app.get('/ping', (_, res) => res.json({m:'pong'}));

// Notifications endpoint
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
    
    // Format the response to match the sample
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

// Redirect /notifications to /api/notifications
app.get('/notifications', (req, res) => {
  const url = `/api/notifications${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  res.redirect(url);
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
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => process.exit(0));
  } catch (e) {
    process.exit(1);
  }
}

// Run the server
start(); 