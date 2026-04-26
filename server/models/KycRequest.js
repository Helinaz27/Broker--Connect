import mongoose from 'mongoose';
import { KYC_STATUS } from '../utils/constants.js'; 

const kycRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    documentType: {
        type: String,
        trim: true,
        enum: ['kebele', 'national_id', 'passport'],
        required: true
    },
    // documentNumber: {
    //     type: String,
    //     required: true,
    //     trim: true, 
    //     uppercase: true 
    // },
    documentImageUrl: {
        type: String,
        required: true,
        trim: true 
    },
    status: {
        type: String,
        enum: ['pending','approved','rejected'], 
        default: 'PENDING', 
        index: true 
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewNote: {
        type: String,
        default :'',
        trim: true 
    },
    reviewedAt: {
        type: Date
    },
    submissionCount: {
        type: Number,
        default: 1
    },
    // previousRequests: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'KycRequest'
    // }]
}, {
    timestamps: true
});


kycRequestSchema.pre('save', function(next) {
    if (this.status !== PENDING) {
        this.reviewedAt = new Date();
    }
    
    if (this.documentNumber) {
        this.documentNumber = this.documentNumber.toUpperCase();
    }
    
    next();
});

const KycRequest = mongoose.model('KycRequest', kycRequestSchema);

export default KycRequest;