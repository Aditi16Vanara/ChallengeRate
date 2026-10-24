const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const Order = require('../models/Order');
const { getMongoStatus } = require('../config/db');

// GET /api/wallet (Get wallet balance & transactions)
router.get('/', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;

    if (getMongoStatus()) {
      let targetUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        targetUser = await User.findById(userId);
      } else if (userEmail) {
        targetUser = await User.findOne({ email: userEmail.toLowerCase() });
      }

      if (!targetUser) {
        targetUser = await User.findOne();
      }

      if (!targetUser) {
        return res.json({
          success: true,
          balance: 0,
          escrowHeld: 0,
          transactions: [],
          credit: { limit: 50000, used: 0, available: 50000, isApproved: true }
        });
      }

      let wallet = await Wallet.findOne({ user: targetUser._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: targetUser._id, balance: 12500, escrowHeld: 0 });
      }

      const transactions = await WalletTransaction.find({ wallet: wallet._id }).sort({ createdAt: -1 });

      const creditAvailable = Math.max(0, (targetUser.creditLimit || 50000) - (targetUser.creditUsed || 0));

      return res.json({
        success: true,
        balance: wallet.balance,
        escrowHeld: wallet.escrowHeld || 0,
        currency: 'INR',
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email
        },
        credit: {
          limit: targetUser.creditLimit || 50000,
          used: targetUser.creditUsed || 0,
          available: creditAvailable,
          isApproved: targetUser.isCreditApproved !== false
        },
        transactions
      });
    }

    // In-memory fallback
    return res.json({
      success: true,
      balance: 15000,
      escrowHeld: 0,
      currency: 'INR',
      credit: { limit: 50000, used: 0, available: 50000, isApproved: true },
      transactions: [
        {
          _id: 'tx_demo_1',
          type: 'TOPUP_SIMULATED',
          amount: 15000,
          balanceAfter: 15000,
          status: 'SUCCESS',
          referenceId: 'TXN-SIM-001',
          description: 'Simulated Sandbox Top-Up via UPI',
          createdAt: new Date()
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/wallet/topup (Add funds with simulated ledger)
router.post('/topup', async (req, res) => {
  try {
    const { userId, userEmail, amount, paymentMethod } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount greater than 0.' });
    }

    if (getMongoStatus()) {
      let targetUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) targetUser = await User.findById(userId);
      else if (userEmail) targetUser = await User.findOne({ email: userEmail.toLowerCase() });
      if (!targetUser) targetUser = await User.findOne();

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User account not found.' });
      }

      let wallet = await Wallet.findOne({ user: targetUser._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: targetUser._id, balance: 0, escrowHeld: 0 });
      }

      wallet.balance += numAmount;
      wallet.updatedAt = new Date();
      await wallet.save();

      const txnRef = `TXN-SIM-${Math.floor(100000 + Math.random() * 900000)}`;

      const txn = await WalletTransaction.create({
        wallet: wallet._id,
        user: targetUser._id,
        type: 'TOPUP_SIMULATED',
        amount: numAmount,
        balanceAfter: wallet.balance,
        status: 'SUCCESS',
        referenceId: txnRef,
        description: `Simulated Sandbox Top-up via ${paymentMethod || 'UPI QR / NetBanking'}`,
        isSimulated: true
      });

      return res.json({
        success: true,
        message: `Successfully topped up ₹${numAmount.toLocaleString('en-IN')} (Simulated Sandbox)!`,
        balance: wallet.balance,
        transaction: txn
      });
    }

    return res.json({
      success: true,
      message: `Successfully topped up ₹${numAmount.toLocaleString('en-IN')} (Demo Mode)!`,
      balance: 15000 + numAmount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/wallet/credit/repay (Repay outstanding 10-day credit)
router.post('/credit/repay', async (req, res) => {
  try {
    const { userId, userEmail, amount, repaymentMethod } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid repayment amount.' });
    }

    if (getMongoStatus()) {
      let user = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) user = await User.findById(userId);
      else if (userEmail) user = await User.findOne({ email: userEmail.toLowerCase() });
      if (!user) user = await User.findOne();

      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if ((user.creditUsed || 0) <= 0) {
        return res.status(400).json({ success: false, message: 'No outstanding credit to repay.' });
      }

      const repayAmt = Math.min(numAmount, user.creditUsed);
      user.creditUsed -= repayAmt;
      await user.save();

      let wallet = await Wallet.findOne({ user: user._id });
      if (wallet) {
        await WalletTransaction.create({
          wallet: wallet._id,
          user: user._id,
          type: 'CREDIT_REPAYMENT',
          amount: repayAmt,
          balanceAfter: wallet.balance,
          status: 'SUCCESS',
          referenceId: `TXN-CRD-${Date.now()}`,
          description: `Repayment of ₹${repayAmt} towards 10-day credit line via ${repaymentMethod || 'Online'}`,
          isSimulated: true
        });
      }

      return res.json({
        success: true,
        message: `Successfully repaid ₹${repayAmt.toLocaleString('en-IN')} towards your credit limit!`,
        creditLimit: user.creditLimit,
        creditUsed: user.creditUsed,
        creditAvailable: user.creditLimit - user.creditUsed
      });
    }

    return res.json({ success: true, message: 'Credit repaid (Demo Mode)!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
