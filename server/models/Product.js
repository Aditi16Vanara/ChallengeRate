const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  moq: { type: String, required: true }, // e.g. "500 Kgs", "1000 Meters", "35 bottle"
  moqNumber: { type: Number },
  orderMultipleNumber: { type: Number },
  priceRange: { type: String, required: true },
  basePrice: { type: Number, required: true },
  unit: { type: String, required: true }, // "bottle", "Kg", "Meter", "Bag", "Unit"
  tiers: [
    {
      minQty: { type: Number },
      maxQty: { type: Number },
      qtyRange: { type: String },
      price: { type: Number, required: true }
    }
  ],
  supplier: {
    name: { type: String, required: true },
    location: { type: String, required: true },
    verified: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 }
  },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewsCount: { type: Number, default: 6426 },
  packing: { type: String, default: 'Standard Packing' },
  gstRate: { type: String, default: '5%' },
  gstRateNumber: { type: Number, default: 5 },
  minOrder: { type: String, default: '1 Unit' },
  orderMultiple: { type: String, default: '1 Unit' },
  onlinePrice: { type: Number },
  creditPrice: { type: Number },
  qualified: { type: Boolean, default: true },
  challengeRateAvailable: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 25000 },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Helper to calculate tier price for a given quantity
productSchema.methods.calculateTierPrice = function (quantity) {
  if (!this.tiers || this.tiers.length === 0) {
    return this.basePrice;
  }

  // Parse tiers to find matching bracket
  // First check if numeric minQty is set
  for (const tier of this.tiers) {
    if (tier.minQty !== undefined && tier.maxQty !== undefined) {
      if (quantity >= tier.minQty && quantity <= tier.maxQty) {
        return tier.price;
      }
    } else if (tier.minQty !== undefined && tier.maxQty === undefined) {
      if (quantity >= tier.minQty) {
        return tier.price;
      }
    }
  }

  // Fallback: parse qtyRange string if minQty/maxQty not populated
  // e.g. "35 - 350 bottles", "> 1000 bottles", "1000 - 3000 Mtr", "> 10000 Mtr"
  for (const tier of this.tiers) {
    if (!tier.qtyRange) continue;
    const str = tier.qtyRange.replace(/,/g, '');
    if (str.includes('>')) {
      const match = str.match(/>\s*(\d+)/);
      if (match && quantity > parseInt(match[1], 10)) {
        return tier.price;
      }
    } else if (str.includes('-')) {
      const parts = str.match(/(\d+)\s*-\s*(\d+)/);
      if (parts) {
        const min = parseInt(parts[1], 10);
        const max = parseInt(parts[2], 10);
        if (quantity >= min && quantity <= max) {
          return tier.price;
        }
      }
    }
  }

  return this.basePrice;
};

module.exports = mongoose.model('Product', productSchema);
