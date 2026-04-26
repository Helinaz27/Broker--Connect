import mongoose from 'mongoose';
import { USER_LEVELS, KYC_STATUS } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  firstname: { 
    type: String,
    required: false,
    trim: true
  },
  lastname: { 
    type: String,
    required: false,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String,
    required: false,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  profileImage: {
    type: String,
    default: null
  },
  
  canCreateListings: {
    type: Boolean,
    default: false
  },

  roles: { 
    type: [String], 
    default: ['user','super_admin', 'admin']
  },
  level: { 
    type: Number, 
    default: USER_LEVELS.NORMAL,
    min: 0,
    max: 2
  },
  coins: { 
    type: Number
  },
  freeTrial: {
    used: { 
      type: Boolean, 
      default: false 
    },
    availableUntil: { 
      type: Date,
      default: () => new Date(+new Date() + 7*24*60*60*1000)
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
export default User;