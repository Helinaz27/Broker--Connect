import mongoose from 'mongoose';
import { TRANSACTION_REASONS } from '../utils/constants.js';

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: [
      'welcome_bonus',    
      'kyc_bonus',        
      'purchase',          
      'posting_fee',       
      'contact_access',    
      'user_transfer',    
      'refund'             
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId
  },
  listingType: {
    type: String,
    enum: ['house', 'car', 'service']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Payment', 'HouseListing', 'Car', 'ServiceListing', 'KycRequest']
  }
}, {
  timestamps: true
});

coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ reason: 1 });
coinTransactionSchema.index({ relatedUserId: 1 }); 

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);

export default CoinTransaction;