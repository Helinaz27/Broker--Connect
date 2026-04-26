import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        trim: true
    },
    fileSize: {
        type: Number
    },
    fileName: {
        type: String,
        trim: true
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isVisible: {
        type: Boolean,
        default: true
    },
    visibleUntil: {
        type: Date
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ roomId: 1, isVisible: 1 });
messageSchema.index({ visibleUntil: 1 }, { expireAfterSeconds: 0 }); 

messageSchema.methods.hideIfExpired = function() {
    if (this.visibleUntil && this.visibleUntil < new Date()) {
        this.isVisible = false;
    }
    return this;
};

messageSchema.statics.getVisibleMessages = async function(roomId, userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    await this.updateMany(
        { 
            roomId, 
            visibleUntil: { $lt: new Date() },
            isVisible: true 
        },
        { isVisible: false }
    );
    
    return await this.find({ 
        roomId, 
        isVisible: true,
        isDeleted: false
    })
    .populate('senderId', 'username firstname lastname profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Message = mongoose.model('Message', messageSchema);

export default Message;