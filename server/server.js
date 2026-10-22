const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./data/seedData');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ChallengeRate B2B API',
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
    console.log(`====================================================`);
  });
});
