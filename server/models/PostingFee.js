import mongoose from 'mongoose';

const postingFeeSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['house', 'car', 'service'],
        required: true,
        index: true 
    },
    durationDays: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 day'] 
    },
    priceBirr: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'] 
    },
    description: {
        type: String,
        required: true,
        trim: true 
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feeType: {
        type: String,
        enum: ['fixed', 'percentage', 'tiered'],
        default: 'fixed'
    },
    tierRanges: [{
        minListings: Number,
        maxListings: Number,
        pricePerListing: Number
    }]
}, {
    timestamps: true
});

postingFeeSchema.index({ category: 1, isActive: 1 });

const PostingFee = mongoose.model('PostingFee', postingFeeSchema);

export default PostingFee;