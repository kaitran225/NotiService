const express = require('express');
const { pool } = require('./db');
const { authenticateToken } = require('./middleware');

const router = express.Router();

// Get notifications for authenticated user or specified userId (if authorized)
router.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    // Get the requesting user's ID from token
    const tokenUid = req.user.uid;
    
    if (!tokenUid) {
      return res.status(400).json({ error: 'No uid in token' });
    }
    
    // Check if a specific userId was requested
    const requestedUserId = req.query.userId;
    
    // Determine which userId to use
    let finalUserId = tokenUid;
    
    // If a specific userId was requested and it's different from the token's uid
    if (requestedUserId && requestedUserId !== tokenUid) {
      // Check if user has manager role (isManager claim in token)
      const isManager = req.user.isManager === true;
      
      // Only managers can view other users' notifications
      if (!isManager) {
        return res.status(403).json({ error: 'Not authorized to view other users notifications' });
      }
      
      // If we get here, the user is a manager and can view the requested userId's notifications
      finalUserId = requestedUserId;
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

module.exports = router; 