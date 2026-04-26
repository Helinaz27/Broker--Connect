import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContactAccess'
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    listingType: {
        type: String,
        enum: ['house', 'car', 'service']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

chatRoomSchema.index({ participants: 1, listingId: 1 }, { unique: true });

chatRoomSchema.methods.isExpired = function() {
    return this.expiresAt < new Date();
};

chatRoomSchema.statics.getVisibleRooms = async function(userId) {
    await this.updateMany(
        { 
            participants: userId,
            expiresAt: { $lt: new Date() },
            isVisible: true 
        },
        { isVisible: false }
    );
    
    return await this.find({ 
        participants: userId,
        isVisible: true
    })
    .populate('participants', 'username firstname lastname profileImage')
    .sort({ updatedAt: -1 });
};

const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;