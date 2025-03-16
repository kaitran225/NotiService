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
    
    // Query notifications for the user
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [uid]
    );
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new notification
router.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }
    
    // Insert the notification
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [userId, message]
    );
    
    res.status(201).json({ 
      message: 'Notification created successfully',
      notificationId: result.insertId 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a notification as read
router.patch('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID (uid) not found in token' });
    }
    
    // Check if the notification exists and belongs to the user
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, uid]
    );
    
    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Update the notification
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 