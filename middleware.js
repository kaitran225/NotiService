const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

// Middleware to authenticate JWT token and extract uid
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token and extract claims
    const decoded = jwt.verify(token, jwtSecret);
    
    // Store all claims in req.user
    req.user = decoded;
    
    // Log the claims for debugging (remove in production)
    console.log('JWT Claims:', decoded);
    
    // Check if uid exists in the token
    if (!decoded.uid) {
      console.warn('Warning: uid not found in JWT token');
    }
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = {
  authenticateToken
}; 