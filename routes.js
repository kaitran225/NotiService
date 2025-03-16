const express = require('express');
const { pool } = require('./db');
const { authenticateToken } = require('./middleware');

const router = express.Router();

// Get notifications for authenticated user
router.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ error: 'No uid in token' });
    }
    
    // Query with limit to reduce memory usage
    const [notifications] = await pool.query(
      'SELECT NotificationID, Title, Message, IsRead, CreatedAt FROM Notifications WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 20',
      [uid]
    );
    
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router; 