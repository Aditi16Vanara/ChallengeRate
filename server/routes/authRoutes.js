const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const PartnerApplication = require('../models/PartnerApplication');
const { getMongoStatus } = require('../config/db');
const { protect, authorize, JWT_SECRET } = require('../middleware/auth');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, gstin, phone, city, state } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (getMongoStatus()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const assignedRole = ['buyer', 'supplier', 'admin'].includes(role) ? role : 'buyer';
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        businessName: businessName || (assignedRole === 'supplier' ? `${name} Manufacturing` : ''),
        gstin: gstin || '',
        phone: phone || '+91 98765 43210',
        address: {
          street: 'G-30, Meridian Business Center, Lajamni Chowk',
          city: city || 'Surat',
          state: state || 'Gujarat',
          pincode: '394101'
        },
        creditLimit: 50000,
        creditUsed: 0,
        isCreditApproved: true,
        partnerStatus: assignedRole === 'supplier' ? 'APPROVED' : 'NONE'
      });

      // Initialize Wallet
      await Wallet.create({ user: newUser._id, balance: 10000, escrowHeld: 0 });

      const token = generateToken(newUser);

      return res.json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          businessName: newUser.businessName,
          gstin: newUser.gstin,
          creditLimit: newUser.creditLimit,
          creditUsed: newUser.creditUsed,
          isCreditApproved: newUser.isCreditApproved
        }
      });
    }

    // In-memory mock response
    const mockUser = { _id: 'usr_demo_101', name, email, role: role || 'buyer' };
    const token = generateToken(mockUser);
    return res.json({
      success: true,
      message: 'Registered successfully (Demo Mode)!',
      token,
      user: mockUser
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
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Ensure wallet exists
      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: user._id, balance: 5000, escrowHeld: 0 });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessName: user.businessName,
          gstin: user.gstin,
          creditLimit: user.creditLimit,
          creditUsed: user.creditUsed,
          isCreditApproved: user.isCreditApproved,
          partnerStatus: user.partnerStatus,
          address: user.address,
          phone: user.phone
        }
      });
    }

    // In-memory mock login for quick testing
    const mockUser = {
      _id: 'usr_demo_101',
      name: email.split('@')[0],
      email,
      role: email.includes('supplier') ? 'supplier' : email.includes('admin') ? 'admin' : 'buyer'
    };
    const token = generateToken(mockUser);
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: mockUser
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me (Get profile of logged-in user)
router.get('/me', protect, async (req, res) => {
  try {
    if (!getMongoStatus()) {
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          businessName: 'Aditi Commercial Traders',
          gstin: '24AAACA1234A1Z0',
          creditLimit: 50000,
          creditUsed: 0,
          isCreditApproved: true,
          walletBalance: 12500,
          phone: '+91 98765 43210',
          address: {
            street: 'G-30, Meridian Business Center, Lajamni Chowk',
            city: 'Surat',
            state: 'Gujarat',
            pincode: '394101'
          }
        }
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 10000, escrowHeld: 0 });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        gstin: user.gstin,
        phone: user.phone,
        address: user.address,
        creditLimit: user.creditLimit,
        creditUsed: user.creditUsed,
        isCreditApproved: user.isCreditApproved,
        partnerStatus: user.partnerStatus,
        walletBalance: wallet.balance,
        escrowHeld: wallet.escrowHeld
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/profile (Update profile)
router.put('/profile', protect, async (req, res) => {
  try {
    if (!getMongoStatus()) {
      return res.json({ success: true, message: 'Profile updated in demo mode!' });
    }

    const { name, businessName, gstin, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (businessName !== undefined) user.businessName = businessName;
    if (gstin !== undefined) user.gstin = gstin;
    if (phone !== undefined) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street || user.address.street,
        city: address.city || user.address.city,
        state: address.state || user.address.state,
        pincode: address.pincode || user.address.pincode
      };
    }

    await user.save();
    return res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/partners/apply (Submit partner application)
router.post('/partners/apply', async (req, res) => {
  try {
    const { companyName, gstin, category, city, state, phone, email } = req.body;
    if (!companyName || !gstin || !category) {
      return res.status(400).json({ success: false, message: 'Please provide company name, GSTIN, and category.' });
    }

    if (getMongoStatus()) {
      const application = await PartnerApplication.create({
        companyName,
        gstin,
        category,
        city: city || 'Surat',
        state: state || 'Gujarat',
        phone,
        email,
        status: 'PENDING'
      });

      return res.json({
        success: true,
        message: 'Partner manufacturer application submitted successfully!',
        data: application
      });
    }

    return res.json({
      success: true,
      message: 'Partner application submitted (Demo Mode)!',
      data: { companyName, gstin, status: 'PENDING' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/partners (List partner applications - Admin / Reviewer)
router.get('/partners', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const applications = await PartnerApplication.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: applications.length, data: applications });
    }
    return res.json({ success: true, count: 1, data: [{ companyName: 'Surat Textiles Mills', status: 'APPROVED' }] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/partners/:id/status (Approve or Reject partner application)
router.put('/partners/:id/status', async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    if (getMongoStatus()) {
      const application = await PartnerApplication.findById(req.params.id);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      application.status = status;
      application.reviewNotes = reviewNotes || '';
      application.reviewedAt = new Date();
      await application.save();

      // If user is linked, update their partnerStatus and role to supplier
      if (application.user && status === 'APPROVED') {
        await User.findByIdAndUpdate(application.user, {
          role: 'supplier',
          partnerStatus: 'APPROVED'
        });
      }

      return res.json({ success: true, message: `Application marked as ${status}!`, data: application });
    }

    return res.json({ success: true, message: `Application ${status} (Demo Mode)` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
