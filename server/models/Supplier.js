const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessType: { type: String, default: 'Manufacturer & Exporter' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  verified: { type: Boolean, default: true },
  establishedYear: { type: Number },
  categories: [{ type: String }],
  rating: { type: Number, default: 4.8 },
  phone: { type: String },
  email: { type: String }
});

module.exports = mongoose.model('Supplier', supplierSchema);
