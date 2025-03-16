const express = require('express');
const { pool } = require('./db');
const { authenticateToken } = require('./middleware');

const router = express.Router();

// Single optimized endpoint for notifications with optional userId
router.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    // Get the requesting user's ID from token
    const tokenUid = req.user.uid;
    
    if (!tokenUid) {
      return res.status(400).json({ error: 'No uid in token' });
    }
    
    // Check if a specific userId was requested (optional parameter)
    const requestedUserId = req.query.userId;
    
    // Use the requested userId if provided, otherwise use the token's uid
    const finalUserId = requestedUserId || tokenUid;
    
    // If trying to access another user's notifications, check for manager role
    if (requestedUserId && requestedUserId !== tokenUid) {
      const isManager = req.user.MANAGER === true;
      if (!isManager) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }
    
    // Query with limit to reduce memory usage
    const [notifications] = await pool.query(
      'SELECT NotificationID, Title, Message, Type, IsRead, CreatedAt FROM Notifications WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 20',
      [finalUserId]
    );
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// Alias for the root path (redirects to /api/notifications)
router.get('/notifications', (req, res) => {
  const url = `/api/notifications${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  res.redirect(url);
});

module.exports = router; 