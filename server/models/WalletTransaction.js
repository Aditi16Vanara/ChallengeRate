const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'TOPUP_SIMULATED',
      'TOPUP_GATEWAY',
      'ORDER_DEBIT',
      'ORDER_REFUND',
      'ESCROW_RELEASE',
      'CREDIT_REPAYMENT'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
  referenceId: { type: String, required: true },
  description: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isSimulated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
