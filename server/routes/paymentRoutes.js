const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const { getMongoStatus } = require('../config/db');

// POST /api/payments/create-intent
// Creates a gateway payment order (Razorpay compatible payload, with fallback simulation)
router.post('/create-intent', async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;

    const gatewayKey = process.env.RAZORPAY_KEY_ID;
    const isGatewayConfigured = Boolean(gatewayKey && process.env.RAZORPAY_KEY_SECRET);

    const paymentOrderId = `pay_ord_${Math.floor(100000 + Math.random() * 900000)}`;

    return res.json({
      success: true,
      isSimulated: !isGatewayConfigured,
      mode: isGatewayConfigured ? 'LIVE_SANDBOX' : 'SIMULATED_ESCROW',
      paymentOrderId,
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      keyId: gatewayKey || 'rzp_test_simulated_challenge_rate',
      notes: {
        platform: 'ChallengeRate B2B Wholesale Escrow',
        orderId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/verify
// Verifies payment signature and marks order as ESCROW_HELD
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature, isSimulated } = req.body;

    // In simulated sandbox mode:
    if (isSimulated || !process.env.RAZORPAY_KEY_SECRET) {
      if (getMongoStatus() && orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'ESCROW_HELD',
          escrowStatus: 'HELD'
        });
      }
      return res.json({
        success: true,
        verified: true,
        isSimulated: true,
        message: 'Payment verified in simulated sandbox mode. Escrow protection active!'
      });
    }

    // Real HMAC signature verification if credentials provided
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature === signature) {
      if (getMongoStatus() && orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'ESCROW_HELD',
          escrowStatus: 'HELD'
        });
      }
      return res.json({ success: true, verified: true, message: 'Payment verified successfully.' });
    } else {
      return res.status(400).json({ success: false, verified: false, message: 'Invalid payment signature.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
