const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getMongoStatus } = require('../config/db');
const { initialProducts, seedDatabase } = require('../data/seedData');

// Helper to extract numeric MOQ
const extractNumeric = (val, defaultVal = 1) => {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const match = String(val).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : defaultVal;
};

// GET /api/products (Optional query params: category, q, seller)
router.get('/', async (req, res) => {
  try {
    const { category, q, seller } = req.query;

    if (getMongoStatus()) {
      let count = await Product.countDocuments();
      if (count === 0) {
        await seedDatabase();
      }
      let query = {};
      if (category && category !== 'All') {
        query.category = { $regex: new RegExp(category, 'i') };
      }
      if (seller) {
        query['supplier.name'] = { $regex: new RegExp(seller, 'i') };
      }
      if (q) {
        query.$or = [
          { title: { $regex: new RegExp(q, 'i') } },
          { description: { $regex: new RegExp(q, 'i') } },
          { 'supplier.name': { $regex: new RegExp(q, 'i') } }
        ];
      }
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: products.length, data: products, source: 'MongoDB' });
    }

    // Fallback Memory Data Filter
    let filtered = [...initialProducts];
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (q) {
      const term = q.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.supplier.name.toLowerCase().includes(term)
      );
    }
    return res.json({ success: true, count: filtered.length, data: filtered, source: 'InMemory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const product = await Product.findById(req.params.id);
      if (product) return res.json({ success: true, data: product });
    }
    const product = initialProducts.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/validate-cart
// Server-side validation of cart items, calculating true tier prices and taxes
router.post('/validate-cart', async (req, res) => {
  try {
    const { items } = req.body; // array of { productId, quantity }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No cart items provided for validation.' });
    }

    const validatedItems = [];
    let subtotal = 0;
    let gstTotal = 0;
    const errors = [];

    for (const item of items) {
      let product = null;
      if (getMongoStatus()) {
        product = await Product.findById(item.productId);
      }
      if (!product) {
        product = initialProducts.find(p => p._id === item.productId);
      }

      if (!product) {
        errors.push(`Product ID ${item.productId} not found.`);
        continue;
      }

      if (product.inStock === false) {
        errors.push(`"${product.title}" is currently out of stock.`);
        continue;
      }

      const moqNum = extractNumeric(product.minOrder || product.moq, 1);
      const multipleNum = extractNumeric(product.orderMultiple || product.moq, 1);

      // Validate MOQ
      if (item.quantity < moqNum) {
        errors.push(`"${product.title}" requires a minimum order of ${product.minOrder || product.moq} (requested ${item.quantity}).`);
      }

      // Calculate unit price from tiers
      let unitPrice = product.basePrice;
      let appliedTier = 'Base Tier';

      if (product.calculateTierPrice) {
        unitPrice = product.calculateTierPrice(item.quantity);
      } else if (product.tiers && product.tiers.length > 0) {
        for (const tier of product.tiers) {
          if (!tier.qtyRange) continue;
          const str = tier.qtyRange.replace(/,/g, '');
          if (str.includes('>')) {
            const m = str.match(/>\s*(\d+)/);
            if (m && item.quantity > parseInt(m[1], 10)) {
              unitPrice = tier.price;
              appliedTier = tier.qtyRange;
              break;
            }
          } else if (str.includes('-')) {
            const m = str.match(/(\d+)\s*-\s*(\d+)/);
            if (m) {
              const min = parseInt(m[1], 10);
              const max = parseInt(m[2], 10);
              if (item.quantity >= min && item.quantity <= max) {
                unitPrice = tier.price;
                appliedTier = tier.qtyRange;
                break;
              }
            }
          }
        }
      }

      const itemSubtotal = unitPrice * item.quantity;
      const gstRateNum = extractNumeric(product.gstRate, 5);
      const itemGst = Math.round((itemSubtotal * (gstRateNum / 100)) * 100) / 100;
      const itemTotal = itemSubtotal + itemGst;

      subtotal += itemSubtotal;
      gstTotal += itemGst;

      validatedItems.push({
        product: product._id,
        title: product.title,
        image: product.image,
        supplierName: product.supplier ? product.supplier.name : 'Verified Manufacturer',
        quantity: item.quantity,
        unit: product.unit || 'Unit',
        unitPrice,
        appliedTier,
        packing: product.packing || 'Standard Packing',
        gstRate: product.gstRate || `${gstRateNum}%`,
        gstAmount: itemGst,
        subtotal: itemSubtotal,
        total: itemTotal
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors, message: errors.join(' ') });
    }

    return res.json({
      success: true,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      totalAmount: Math.round((subtotal + gstTotal) * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (Add product - Supplier Portal)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      image,
      moq,
      priceRange,
      basePrice,
      unit,
      tiers,
      supplierName,
      location,
      packing,
      gstRate,
      minOrder,
      orderMultiple,
      stockQuantity
    } = req.body;

    if (!title || !category || !basePrice || !unit) {
      return res.status(400).json({ success: false, message: 'Title, category, base price, and unit are required.' });
    }

    const newProductData = {
      title,
      category,
      description: description || 'High quality wholesale product sourced directly from Indian verified manufacturers.',
      image: image || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=800',
      moq: moq || minOrder || '100 Units',
      priceRange: priceRange || `₹${basePrice} / ${unit}`,
      basePrice: Number(basePrice),
      unit,
      tiers: tiers || [
        { qtyRange: `100 - 500 ${unit}`, price: Number(basePrice) },
        { qtyRange: `> 500 ${unit}`, price: Math.round(Number(basePrice) * 0.95) }
      ],
      supplier: {
        name: supplierName || 'Meridian Manufacturing Group',
        location: location || 'Surat, Gujarat',
        verified: true,
        rating: 4.9
      },
      packing: packing || `1 ${unit}`,
      gstRate: gstRate || '5%',
      minOrder: minOrder || moq || '100 Units',
      orderMultiple: orderMultiple || minOrder || moq || '100 Units',
      onlinePrice: Number(basePrice),
      creditPrice: Math.round(Number(basePrice) * 1.05),
      stockQuantity: stockQuantity ? Number(stockQuantity) : 25000,
      inStock: true,
      qualified: true,
      challengeRateAvailable: true
    };

    if (getMongoStatus()) {
      const created = await Product.create(newProductData);
      return res.status(201).json({ success: true, message: 'Product created successfully!', data: created });
    }

    initialProducts.unshift({ _id: `prod_custom_${Date.now()}`, ...newProductData });
    return res.status(201).json({ success: true, message: 'Product created in demo store!', data: newProductData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (Edit product)
router.put('/:id', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product updated successfully!', data: updated });
    }
    return res.json({ success: true, message: 'Product updated (Demo Mode)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/products/:id/stock (Toggle in-stock status)
router.patch('/:id/stock', async (req, res) => {
  try {
    const { inStock } = req.body;
    if (getMongoStatus()) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      product.inStock = inStock !== undefined ? inStock : !product.inStock;
      await product.save();
      return res.json({ success: true, message: `Product is now ${product.inStock ? 'In Stock' : 'Out of Stock'}!`, inStock: product.inStock });
    }
    return res.json({ success: true, message: 'Stock status updated (Demo Mode)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
