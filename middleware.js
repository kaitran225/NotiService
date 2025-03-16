const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

// Minimal JWT verification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Store user info from token
    req.user = {
      uid: decoded.uid,
      isManager: decoded.isManager === true
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken
}; 