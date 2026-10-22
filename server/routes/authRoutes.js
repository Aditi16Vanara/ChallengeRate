const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, gstin } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (getMongoStatus()) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }
      const newUser = await User.create({ name, email, password, role, businessName, gstin });
      return res.json({
        success: true,
        message: 'Account registered successfully!',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

    // In-memory mock response
    return res.json({
      success: true,
      message: 'Registered successfully (Demo Mode)!',
      user: { id: 'usr_demo', name, email, role: role || 'buyer' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (getMongoStatus()) {
      const user = await User.findOne({ email });
      if (user && user.password === password) {
        return res.json({
          success: true,
          message: 'Login successful!',
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // In-memory mock login for quick testing
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: { id: 'usr_demo_101', name: email.split('@')[0], email, role: 'buyer' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
