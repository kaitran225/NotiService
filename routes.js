const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const { jwtSecret } = require('./config');
const { authenticateToken } = require('./middleware');

const router = express.Router();



// Get all notifications for the authenticated user based on uid from JWT token
router.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    // The uid is extracted from the JWT token in the middleware
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID (uid) not found in token' });
    }
    
    // Query notifications for the user from the existing Notifications table
    const [notifications] = await pool.query(
      'SELECT * FROM Notifications WHERE UserID = ? ORDER BY CreatedAt DESC',
      [uid]
    );
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 