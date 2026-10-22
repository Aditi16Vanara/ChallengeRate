const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getMongoStatus } = require('../config/db');

// In-memory fallback orders if Mongo offline
let inMemoryOrders = [];

const extractNumeric = (val, defaultVal = 1) => {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const match = String(val).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : defaultVal;
};

// POST /api/orders (Create B2B order with full server validation)
router.post('/', async (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      items,
      shippingAddress,
      gstin,
      paymentMethod // 'ONLINE' | 'CREDIT_10_DAYS' | 'WALLET'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Please add items to checkout.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    const orderNumber = `CR-ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Validate each item on server
    const processedItems = [];
    let subtotal = 0;
    let gstTotal = 0;
    let primarySupplier = 'ChallengeRate Verified Manufacturer';

    for (const item of items) {
      let product = null;
      if (getMongoStatus()) {
        product = await Product.findById(item.productId || item.product);
      }
      if (!product) {
        const { initialProducts } = require('../data/seedData');
        product = initialProducts.find(p => p._id === (item.productId || item.product));
      }

      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.title || item.productId} was not found.` });
      }

      if (product.inStock === false) {
        return res.status(400).json({ success: false, message: `Product "${product.title}" is currently out of stock.` });
      }

      const moqNum = extractNumeric(product.minOrder || product.moq, 1);
      if (item.quantity < moqNum) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" requires minimum order of ${product.minOrder || product.moq}.`
        });
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

      const itemSub = unitPrice * item.quantity;
      const gstRateNum = extractNumeric(product.gstRate, 5);
      const itemGst = Math.round((itemSub * (gstRateNum / 100)) * 100) / 100;
      const itemTot = itemSub + itemGst;

      subtotal += itemSub;
      gstTotal += itemGst;

      if (product.supplier && product.supplier.name) {
        primarySupplier = product.supplier.name;
      }

      processedItems.push({
        product: product._id,
        title: product.title,
        image: product.image,
        quantity: item.quantity,
        unit: product.unit || 'Unit',
        unitPrice,
        tierApplied: appliedTier,
        packing: product.packing || 'Standard Packing',
        supplierName: product.supplier ? product.supplier.name : primarySupplier,
        gstRate: product.gstRate || `${gstRateNum}%`,
        gstAmount: itemGst,
        subtotal: itemSub,
        total: itemTot
      });
    }

    const totalAmount = Math.round((subtotal + gstTotal) * 100) / 100;

    // Payment validation
    let paymentStatus = 'ESCROW_HELD';
    let dueDate = null;

    if (paymentMethod === 'CREDIT_10_DAYS') {
      dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days term
      paymentStatus = 'CREDIT_PENDING';

      // Check credit limit if user exists
      if (getMongoStatus() && buyerId) {
        const user = await User.findById(buyerId);
        if (user) {
          const availableCredit = (user.creditLimit || 50000) - (user.creditUsed || 0);
          if (totalAmount > availableCredit) {
            return res.status(400).json({
              success: false,
              message: `Order amount (₹${totalAmount}) exceeds your available 10-day credit limit (₹${availableCredit}).`
            });
          }
          user.creditUsed = (user.creditUsed || 0) + totalAmount;
          await user.save();
        }
      }
    } else if (paymentMethod === 'WALLET') {
      if (getMongoStatus() && buyerId) {
        const wallet = await Wallet.findOne({ user: buyerId });
        if (!wallet || wallet.balance < totalAmount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient wallet balance (Available: ₹${wallet ? wallet.balance : 0}, Required: ₹${totalAmount}). Please top up first.`
          });
        }
        wallet.balance -= totalAmount;
        wallet.escrowHeld = (wallet.escrowHeld || 0) + totalAmount;
        await wallet.save();

        await WalletTransaction.create({
          wallet: wallet._id,
          user: buyerId,
          type: 'ORDER_DEBIT',
          amount: totalAmount,
          balanceAfter: wallet.balance,
          status: 'SUCCESS',
          referenceId: `TXN-WLT-${Date.now()}`,
          description: `Debit for Order ${orderNumber} (Escrow Protected)`,
          isSimulated: true
        });
      }
      paymentStatus = 'ESCROW_HELD';
    }

    const newOrderData = {
      orderNumber,
      buyer: buyerId || '6aabc0943bd7ad806eabb799',
      buyerName: buyerName || 'Aditi Vanara',
      buyerEmail: buyerEmail || 'aditi@business.com',
      buyerPhone: buyerPhone || shippingAddress.phone || '+91 98765 43210',
      supplierName: primarySupplier,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      shippingCharges: 0,
      totalAmount,
      shippingAddress: {
        recipientName: shippingAddress.recipientName || buyerName || 'Aditi Vanara',
        phone: shippingAddress.phone || buyerPhone || '+91 98765 43210',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'Gujarat',
        pincode: shippingAddress.pincode || '394101'
      },
      gstin: gstin || '24AAACA1234A1Z0',
      paymentMethod: paymentMethod || 'ONLINE',
      paymentStatus,
      orderStatus: 'ORDER_PLACED',
      escrowStatus: 'HELD',
      dueDate,
      statusHistory: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date(),
          note: `Order ${orderNumber} created successfully via ${paymentMethod || 'ONLINE'}. Escrow payment initiated.`,
          updatedBy: buyerName || 'Buyer'
        }
      ]
    };

    if (getMongoStatus()) {
      const createdOrder = await Order.create(newOrderData);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! Manufacturer notified.',
        data: createdOrder
      });
    }

    const mockOrder = { _id: `ord_${Date.now()}`, ...newOrderData };
    inMemoryOrders.unshift(mockOrder);
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully (Demo Store)!',
      data: mockOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/my-orders (Buyer's order history)
router.get('/my-orders', async (req, res) => {
  try {
    const { buyerEmail } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (buyerEmail) {
        query.buyerEmail = { $regex: new RegExp(buyerEmail, 'i') };
      }
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    }
    return res.json({ success: true, count: inMemoryOrders.length, data: inMemoryOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/seller-orders (Supplier's incoming orders)
router.get('/seller-orders', async (req, res) => {
  try {
    const { supplierName } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (supplierName) {
        query.supplierName = { $regex: new RegExp(supplierName, 'i') };
      }
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    }
    return res.json({ success: true, count: inMemoryOrders.length, data: inMemoryOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const order = await Order.findById(req.params.id);
      if (order) return res.json({ success: true, data: order });
    }
    const order = inMemoryOrders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/status (Advance order status in pipeline)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, note, ewayBillNumber, courierName, trackingNumber, updatedBy } = req.body;
    const permittedStatuses = [
      'ORDER_PLACED',
      'MANUFACTURER_ACCEPTED',
      'PROCESSING',
      'DISPATCHED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!permittedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    if (getMongoStatus()) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.orderStatus = status;
      if (ewayBillNumber) order.ewayBillNumber = ewayBillNumber;
      if (courierName) order.courierName = courierName;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      if (status === 'DELIVERED') {
        order.escrowStatus = 'READY_FOR_RELEASE';
      } else if (status === 'CANCELLED') {
        order.escrowStatus = 'REFUNDED';
        order.paymentStatus = 'REFUNDED';
      }

      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Order status updated to ${status}`,
        updatedBy: updatedBy || 'Manufacturer'
      });
      order.updatedAt = new Date();

      await order.save();
      return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    }

    return res.json({ success: true, message: `Status updated to ${status} (Demo Mode)` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/:id/confirm-delivery (Buyer marks received -> Releases Escrow)
router.post('/:id/confirm-delivery', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.orderStatus = 'DELIVERED';
      order.escrowStatus = 'RELEASED';
      order.statusHistory.push({
        status: 'DELIVERED',
        timestamp: new Date(),
        note: 'Buyer verified shipment delivery. Escrow funds released to manufacturer.',
        updatedBy: order.buyerName || 'Buyer'
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Delivery confirmed! Escrow funds have been released to the manufacturer.',
        data: order
      });
    }

    return res.json({ success: true, message: 'Delivery confirmed and escrow released (Demo Mode)!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
