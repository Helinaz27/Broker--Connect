import mongoose from 'mongoose';

const contactAccessSchema = new mongoose.Schema({
    viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,

        index: true 
    },
    listingType: {
        type: String,
        enum: ['house', 'car', 'service'],
        required: true,
        index: true 
    },
    coinsPaid: {
        type: Number,
        required: true,
        min: [0, 'Coins paid cannot be negative']
    },
    systemFee: {
        type: Number,
        default: 5
    },
    ownerLimit: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true 
    },
    accessedAt: {
        type: Date
    },
   
    expiresAt: {
        type: Date
    }
});

const ContactAccess = mongoose.model('ContactAccess', contactAccessSchema);

export default ContactAccess;