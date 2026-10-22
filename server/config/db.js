const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/challengerate';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000 // Quick timeout if MongoDB daemon is not currently active
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected to host: ${conn.connection.host} | DB: challengerate`);
    console.log(`[MongoDB Compass Ready] You can connect Compass to: ${mongoURI}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    console.log(`[Fallback] Serving seed marketplace data via in-memory store so the app works seamlessly!`);
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
