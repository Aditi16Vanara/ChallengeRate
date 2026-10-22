const mongoose = require('mongoose');

const challengeRateSchema = new mongoose.Schema({
  challengeId: { type: String, required: true, unique: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String },
  supplierName: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productTitle: { type: String, required: true },
  productImage: { type: String },
  unit: { type: String, default: 'Unit' },
  requestedQuantity: { type: Number, required: true },
  listedPrice: { type: Number, required: true },
  proposedPrice: { type: Number, required: true },
  counterOfferPrice: { type: Number },
  expectedDeliveryTimeline: { type: String, required: true },
  notes: { type: String },
  manufacturerNotes: { type: String },
  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'UNDER_REVIEW',
      'ACCEPTED',
      'COUNTERED',
      'DECLINED',
      'BUYER_ACCEPTED',
      'BUYER_REJECTED',
      'EXPIRED'
    ],
    default: 'SUBMITTED'
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String },
      updatedBy: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChallengeRate', challengeRateSchema);
