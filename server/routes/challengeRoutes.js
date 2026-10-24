const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ChallengeRate = require('../models/ChallengeRate');
const Product = require('../models/Product');
const { getMongoStatus } = require('../config/db');

let inMemoryChallenges = [];

// POST /api/challenges (Buyer submits challenge rate request)
router.post('/', async (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      productId,
      requestedQuantity,
      proposedPrice,
      expectedDeliveryTimeline,
      notes
    } = req.body;

    if (!productId || !requestedQuantity || !proposedPrice) {
      return res.status(400).json({ success: false, message: 'Product, requested quantity, and proposed price are required.' });
    }

    let product = null;
    if (getMongoStatus() && productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product && getMongoStatus() && req.body.productTitle) {
      product = await Product.findOne({ title: { $regex: new RegExp(req.body.productTitle.trim(), 'i') } });
    }
    if (!product) {
      const { initialProducts } = require('../data/seedData');
      product = initialProducts.find(p => p._id === productId || (req.body.productTitle && p.title.toLowerCase() === req.body.productTitle.toLowerCase()));
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const challengeId = `CR-CHL-${Math.floor(100000 + Math.random() * 900000)}`;
    const listedPrice = product.basePrice;

    const newChallengeData = {
      challengeId,
      buyer: buyerId || '6aabc0943bd7ad806eabb799',
      buyerName: buyerName || 'Aditi Vanara',
      buyerEmail: buyerEmail || 'aditi@business.com',
      buyerPhone: buyerPhone || '+91 98765 43210',
      supplierName: product.supplier ? product.supplier.name : 'Clonex',
      supplierId: product.sellerId,
      product: product._id,
      productTitle: product.title,
      productImage: product.image,
      unit: product.unit || 'Unit',
      requestedQuantity: Number(requestedQuantity),
      listedPrice,
      proposedPrice: Number(proposedPrice),
      expectedDeliveryTimeline: expectedDeliveryTimeline || 'Within 7-10 Business Days',
      notes: notes || '',
      status: 'SUBMITTED',
      statusHistory: [
        {
          status: 'SUBMITTED',
          timestamp: new Date(),
          note: `Buyer proposed ₹${proposedPrice}/${product.unit} for ${requestedQuantity} ${product.unit}(s). Listed price was ₹${listedPrice}.`,
          updatedBy: buyerName || 'Buyer'
        }
      ]
    };

    if (getMongoStatus()) {
      const challenge = await ChallengeRate.create(newChallengeData);
      return res.status(201).json({
        success: true,
        message: 'Rate challenge submitted to manufacturer!',
        data: challenge
      });
    }

    const mockChl = { _id: `chl_${Date.now()}`, ...newChallengeData };
    inMemoryChallenges.unshift(mockChl);
    return res.status(201).json({
      success: true,
      message: 'Rate challenge submitted (Demo Mode)!',
      data: mockChl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/challenges/my-challenges (Buyer's challenge requests)
router.get('/my-challenges', async (req, res) => {
  try {
    const { buyerEmail } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (buyerEmail) query.buyerEmail = { $regex: new RegExp(buyerEmail, 'i') };
      const challenges = await ChallengeRate.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: challenges.length, data: challenges });
    }
    return res.json({ success: true, count: inMemoryChallenges.length, data: inMemoryChallenges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/challenges/manufacturer (Incoming challenges for manufacturer)
router.get('/manufacturer', async (req, res) => {
  try {
    const { supplierName } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (supplierName) query.supplierName = { $regex: new RegExp(supplierName, 'i') };
      const challenges = await ChallengeRate.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: challenges.length, data: challenges });
    }
    return res.json({ success: true, count: inMemoryChallenges.length, data: inMemoryChallenges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/challenges/:id/respond (Manufacturer response: ACCEPTED, COUNTERED, DECLINED)
router.put('/:id/respond', async (req, res) => {
  try {
    const { action, counterOfferPrice, notes, manufacturerName } = req.body;
    // action: 'ACCEPT' | 'COUNTER' | 'DECLINE'

    if (!['ACCEPT', 'COUNTER', 'DECLINE'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be ACCEPT, COUNTER, or DECLINE.' });
    }

    if (action === 'COUNTER' && (!counterOfferPrice || counterOfferPrice <= 0)) {
      return res.status(400).json({ success: false, message: 'Counter offer price is required.' });
    }

    const statusMap = {
      ACCEPT: 'ACCEPTED',
      COUNTER: 'COUNTERED',
      DECLINE: 'DECLINED'
    };
    const newStatus = statusMap[action];

    if (getMongoStatus()) {
      let challenge = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        challenge = await ChallengeRate.findById(req.params.id);
      }
      if (!challenge) {
        challenge = await ChallengeRate.findOne({ challengeId: req.params.id });
      }
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge request not found.' });

      challenge.status = newStatus;
      if (action === 'COUNTER') {
        challenge.counterOfferPrice = Number(counterOfferPrice);
      }
      if (notes) challenge.manufacturerNotes = notes;

      challenge.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: action === 'ACCEPT'
          ? `Manufacturer accepted your proposed price of ₹${challenge.proposedPrice}!`
          : action === 'COUNTER'
          ? `Manufacturer counter-offered ₹${counterOfferPrice}/${challenge.unit}. Note: ${notes || 'None'}`
          : `Manufacturer declined the proposed rate.`,
        updatedBy: manufacturerName || challenge.supplierName || 'Manufacturer'
      });
      challenge.updatedAt = new Date();

      await challenge.save();
      return res.json({
        success: true,
        message: `Challenge has been ${newStatus.toLowerCase()}!`,
        data: challenge
      });
    }

    return res.json({ success: true, message: `Challenge ${newStatus} (Demo Mode)!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/challenges/:id/buyer-respond (Buyer response to counter-offer: ACCEPT or REJECT)
router.put('/:id/buyer-respond', async (req, res) => {
  try {
    const { action, buyerName } = req.body; // action: 'ACCEPT' | 'REJECT'
    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be ACCEPT or REJECT.' });
    }

    const newStatus = action === 'ACCEPT' ? 'BUYER_ACCEPTED' : 'BUYER_REJECTED';

    if (getMongoStatus()) {
      let challenge = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        challenge = await ChallengeRate.findById(req.params.id);
      }
      if (!challenge) {
        challenge = await ChallengeRate.findOne({ challengeId: req.params.id });
      }
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge request not found.' });

      challenge.status = newStatus;
      challenge.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: action === 'ACCEPT'
          ? `Buyer accepted counter-offer of ₹${challenge.counterOfferPrice}! Ready to checkout.`
          : 'Buyer rejected counter-offer.',
        updatedBy: buyerName || 'Buyer'
      });
      challenge.updatedAt = new Date();

      await challenge.save();
      return res.json({
        success: true,
        message: `Counter-offer ${action === 'ACCEPT' ? 'accepted' : 'rejected'}!`,
        data: challenge
      });
    }

    return res.json({ success: true, message: `Counter-offer updated (Demo Mode)!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
