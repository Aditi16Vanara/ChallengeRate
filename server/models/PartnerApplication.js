const mongoose = require('mongoose');

const partnerApplicationSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  gstin: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
