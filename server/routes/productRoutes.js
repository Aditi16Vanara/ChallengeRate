const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getMongoStatus } = require('../config/db');
const { initialProducts, seedDatabase } = require('../data/seedData');

// GET /api/products (Optional query params: category, q)
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    
    if (getMongoStatus()) {
      let count = await Product.countDocuments();
      if (count === 0) {
        await seedDatabase();
      }
      let query = {};
      if (category && category !== 'All') {
        query.category = { $regex: new RegExp(category, 'i') };
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

module.exports = router;
