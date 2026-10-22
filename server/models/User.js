const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'supplier', 'admin'], default: 'buyer' },
  businessName: { type: String, default: '' },
  gstin: { type: String, default: '' },
  phone: { type: String, default: '+91 98765 43210' },
  address: {
    street: { type: String, default: 'G-30, Meridian Business Center, Lajamni Chowk' },
    city: { type: String, default: 'Surat' },
    state: { type: String, default: 'Gujarat' },
    pincode: { type: String, default: '394101' }
  },
  creditLimit: { type: Number, default: 50000 },
  creditUsed: { type: Number, default: 0 },
  isCreditApproved: { type: Boolean, default: true },
  partnerStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save password hash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If stored as bcrypt hash
  if (this.password && this.password.startsWith('$2')) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  // Fallback for legacy plain text users
  return candidatePassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
