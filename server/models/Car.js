import mongoose from 'mongoose';
import { LISTING_STATUS, COIN_RULES } from '../utils/constants.js';

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  listing_type: {
    type: String,
    required: true,
    enum: ['sale', 'rent']
  },
  
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  status: {
    type: String,
    default: LISTING_STATUS.ACTIVE,
    enum: Object.values(LISTING_STATUS)
  },
  
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  images: {
    type: [String],
    default: []
  },
  
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    subCity: { 
      type: String
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: [{
      type: Number
    }]
  },
  
  brand: {
    type: String,
    required: true,
    trim: true
  },
  
  model: {
    type: String,
    required: true,
    trim: true
  },
  
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  
  fuel_type: {
    type: String,
    required: true,
    enum: ['petrol', 'diesel', 'electric', 'hybrid']
  },
  
  transmission: {
    type: String,
    required: true,
    enum: ['manual', 'automatic']
  },
  
  seats: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  
  color: {
    type: String,
    required: true,
    trim: true
  },
  
  contactCoinLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  
  paidUntil: {
    type: Date,
    required: true
  }
  
}, {
  timestamps: true 
});

export default mongoose.model('Car', carSchema);