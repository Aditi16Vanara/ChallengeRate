const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { getMongoStatus } = require('../config/db');

let inMemoryInquiries = [];

// POST /api/inquiries (Create inquiry thread)
router.post('/', async (req, res) => {
  try {
    const { buyerId, buyerName, supplierName, productId, productTitle, subject, initialMessage } = req.body;
    if (!subject || !initialMessage) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const inquiryId = `CR-INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInquiryData = {
      inquiryId,
      product: productId,
      productTitle: productTitle || 'B2B Wholesale Material',
      buyer: buyerId || '6aabc0943bd7ad806eabb799',
      buyerName: buyerName || 'Aditi Vanara',
      supplierName: supplierName || 'Clonex',
      subject,
      status: 'OPEN',
      messages: [
        {
          sender: buyerId || '6aabc0943bd7ad806eabb799',
          senderName: buyerName || 'Aditi Vanara',
          senderRole: 'buyer',
          message: initialMessage,
          timestamp: new Date()
        }
      ]
    };

    if (getMongoStatus()) {
      const inquiry = await Inquiry.create(newInquiryData);
      return res.status(201).json({ success: true, message: 'Inquiry sent to manufacturer!', data: inquiry });
    }

    const mockInq = { _id: `inq_${Date.now()}`, ...newInquiryData };
    inMemoryInquiries.unshift(mockInq);
    return res.status(201).json({ success: true, message: 'Inquiry sent (Demo Mode)!', data: mockInq });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inquiries (Fetch inquiries by buyer or supplier)
router.get('/', async (req, res) => {
  try {
    const { buyerName, supplierName } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (buyerName) query.buyerName = { $regex: new RegExp(buyerName, 'i') };
      if (supplierName) query.supplierName = { $regex: new RegExp(supplierName, 'i') };
      const inquiries = await Inquiry.find(query).sort({ updatedAt: -1 });
      return res.json({ success: true, count: inquiries.length, data: inquiries });
    }
    return res.json({ success: true, count: inMemoryInquiries.length, data: inMemoryInquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inquiries/:id/messages (Reply to thread)
router.post('/:id/messages', async (req, res) => {
  try {
    const { senderId, senderName, senderRole, message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

    if (getMongoStatus()) {
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

      inquiry.messages.push({
        sender: senderId || inquiry.buyer,
        senderName: senderName || 'User',
        senderRole: senderRole || 'supplier',
        message,
        timestamp: new Date()
      });
      inquiry.updatedAt = new Date();
      await inquiry.save();

      return res.json({ success: true, message: 'Reply posted!', data: inquiry });
    }

    return res.json({ success: true, message: 'Reply posted (Demo Mode)!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
