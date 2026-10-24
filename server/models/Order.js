const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.Mixed, ref: 'Product' },
  title: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Unit' },
  unitPrice: { type: Number, required: true },
  tierApplied: { type: String },
  packing: { type: String },
  supplierName: { type: String, required: true },
  gstRate: { type: String, default: '5%' },
  gstAmount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  updatedBy: { type: String, default: 'System' }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  buyer: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String },
  supplierName: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  gstTotal: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  gstin: { type: String },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'CREDIT_10_DAYS', 'WALLET'],
    default: 'ONLINE'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'CREDIT_PENDING', 'ESCROW_HELD', 'REFUNDED'],
    default: 'ESCROW_HELD'
  },
  orderStatus: {
    type: String,
    enum: [
      'ORDER_PLACED',
      'MANUFACTURER_ACCEPTED',
      'PROCESSING',
      'DISPATCHED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    ],
    default: 'ORDER_PLACED'
  },
  escrowStatus: {
    type: String,
    enum: ['PENDING', 'HELD', 'READY_FOR_RELEASE', 'RELEASED', 'REFUNDED'],
    default: 'HELD'
  },
  ewayBillNumber: { type: String },
  trackingNumber: { type: String },
  courierName: { type: String },
  dueDate: { type: Date }, // For 10-day credit orders
  isCreditRepaid: { type: Boolean, default: false },
  statusHistory: [statusHistorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
