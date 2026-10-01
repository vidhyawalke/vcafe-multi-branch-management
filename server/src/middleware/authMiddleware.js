const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vcafe_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
