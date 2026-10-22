const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./data/seedData');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const walletRoutes = require('./routes/walletRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ChallengeRate B2B Wholesale Platform API',
    modules: [
      'B2B Cart & Checkout',
      'Challenge Rate Negotiation & Inquiries',
      'Orders & Fulfillment Tracking',
      'Supplier / Manufacturer Portal',
      'Payment, Wallet, Escrow & 10-Day Credit',
      'JWT Auth & RBAC'
    ],
    timestamp: new Date().toISOString()
  });
});

// Connect to DB and Start Server
connectDB().then(() => {
  seedDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ChallengeRate Backend API is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🛍️ Products Endpoint: http://localhost:${PORT}/api/products`);
    console.log(`📦 Orders Endpoint: http://localhost:${PORT}/api/orders`);
    console.log(`⚡ Rate Challenge: http://localhost:${PORT}/api/challenges`);
    console.log(`💳 Wallet Endpoint: http://localhost:${PORT}/api/wallet`);
    console.log(`====================================================`);
  });
});
