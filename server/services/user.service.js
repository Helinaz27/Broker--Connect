import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Check if user exists by email
export const checkUserExistsByEmail = async (email) => {
  return await User.findOne({ email });
};

// Check if username exists
export const checkUsernameExists = async (username) => {
  return await User.findOne({ username });
};

// Get user by ID (without password)
export const getUserById = async (id) => {
  return await User.findById(id).select('-passwordHash');
};

// Get user by username
export const getUserByUsername = async (username) => {
  return await User.findOne({ username }).select('-passwordHash');
};

// Get user by email
export const getUserByEmail = async (email) => {
  return await User.findOne({ email }).select('-passwordHash');
};

// Get all users (without passwords)
export const getAllUsers = async () => {
  return await User.find({}).select('-passwordHash');
};

export const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true, runValidators: true }
  ).select('-passwordHash');
};

// Delete user
export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const formatUserResponse = (user) => {
  return {
    _id: user._id,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    level: user.level,
    coins: user.coins,
    freeTrial: user.freeTrial,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    profileImage: user.profileImage,
    kycStatus: user.kycStatus,
    canCreateListings: user.canCreateListings,
    kycSubmittedAt: user.kycSubmittedAt,
    kycApprovedAt: user.kycApprovedAt,
    kycRejectedAt: user.kycRejectedAt,
    kycRejectionReason: user.kycRejectionReason,
    createdAt: user.createdAt,    
    updatedAt: user.updatedAt 
  };
};