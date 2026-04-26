import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'message',
            'payment_success',
            'kyc_approved',
            'kyc_rejected',
            'kyc_pending',
            'post_created',
            'post_expired',
            'insufficient_coins',
            'new_contact',
            'coins_received',
            'coins_sent',
            'user_transfer',
            'system'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    data: {
        path: {
            type: String
        },
        referenced: {
            type: mongoose.Schema.Types.ObjectId
        },
        amount: {
            type: Number
        },
        listingId: {
            type: mongoose.Schema.Types.ObjectId
        },
        listingType: {
            type: String,
            enum: ['house', 'car', 'service']
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        senderName: {
            type: String
        }
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

export default mongoose.model('Notification', notificationSchema);