const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['buyer', 'supplier', 'admin'], default: 'buyer' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const inquirySchema = new mongoose.Schema({
  inquiryId: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productTitle: { type: String },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  supplierName: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  messages: [messageSchema],
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inquiry', inquirySchema);
