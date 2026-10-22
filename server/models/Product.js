const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  moq: { type: String, required: true }, // e.g. "500 Kgs", "1000 Meters"
  priceRange: { type: String, required: true }, // e.g. "₹120 - ₹180 / Kg"
  basePrice: { type: Number, required: true },
  unit: { type: String, required: true }, // "Kg", "Meter", "Piece", "Bag"
  tiers: [
    {
      qtyRange: { type: String },
      price: { type: Number }
    }
  ],
  supplier: {
    name: { type: String, required: true },
    location: { type: String, required: true },
    verified: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 }
  },
  viewsCount: { type: Number, default: 6426 },
  packing: { type: String, default: 'Standard Packing' },
  gstRate: { type: String, default: '5%' },
  minOrder: { type: String, default: '1 Unit' },
  orderMultiple: { type: String, default: '1 Unit' },
  onlinePrice: { type: Number },
  creditPrice: { type: Number },
  qualified: { type: Boolean, default: true },
  challengeRateAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
