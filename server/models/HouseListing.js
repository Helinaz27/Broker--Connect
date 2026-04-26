
import mongoose from 'mongoose';
import { LISTING_STATUS } from '../utils/constants.js';

const houseListingSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    houseType: {
        type: String,
        enum: ['condominium', 'villa', 'business', 'apartment', 'others'],
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        required: true
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

export default mongoose.model('HouseListing', houseListingSchema);