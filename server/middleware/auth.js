const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'challengerate_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Check if demo query or header exists for graceful fallback if needed
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getMongoStatus()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
    } else {
      // Mock user in in-memory mode
      req.user = {
        _id: decoded.id || 'usr_demo',
        name: decoded.name || 'Aditi',
        email: decoded.email || 'aditi@business.com',
        role: decoded.role || 'buyer'
      };
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
