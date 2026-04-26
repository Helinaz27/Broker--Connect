import mongoose from 'mongoose';
import { LISTING_STATUS, COIN_RULES } from '../utils/constants.js';

const serviceListingSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceType: {
        type: String,
        enum: ['electrician', 'plumber', 'catering', 'house_worker', 'other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    priceRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    location: {
        city: {
            type: String,
            required: true
        },
        subCity: {
            type: String,
            required: true
        },
        placeName: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }
    },
    contactCoinLimit: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    paidUntil: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(LISTING_STATUS),
        default: LISTING_STATUS.ACTIVE
    }
}, {
    timestamps: true
});

export default mongoose.model('ServiceListing', serviceListingSchema);