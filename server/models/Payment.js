import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    amountBirr: {
        type: Number,
        required: true,
        min: [10, 'Amount must be at least 10 Birr']
    },
    coinsReceived: {
        type: Number,
        required: true,
        min: [0, 'Coins received cannot be negative'] 
    },
    paymentMethod: {
        type: String,
        enum: ['telebirr'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },
    purpose: {
        type: String,
        enum: ['buy_coins'],
        default: 'buy_coins'
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
        index: true
    },
    paymentDetails: { 
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

paymentSchema.index({ userId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;