import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import CoinTransaction from '../models/CoinTransaction.js'; 
import { COIN_RULES, TRANSACTION_REASONS } from '../utils/constants.js'; 

import { 
  getUserById as serviceGetUserById,
  getAllUsers as serviceGetAllUsers, 
  updateUser as serviceUpdateUser, 
  formatUserResponse as serviceFormatUserResponse 
} from '../services/userService.js';

import { validateProfileUpdate } from '../validations/userValidation.js';



export const getProfile = async (req, res) => {
  try {
    const user = await serviceGetUserById(req.user._id);
    if(user){
    res.json({
      message: `Welcome to your profile, ${user.firstname || user.username}!`,
      user: serviceFormatUserResponse(user)
    });}
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await serviceGetUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: serviceFormatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validation = validateProfileUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Update failed: ' + validation.errors.join(', ')
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (req.body.firstname !== undefined) updateData.firstname = req.body.firstname;
    if (req.body.lastname !== undefined) updateData.lastname = req.body.lastname;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.level !== undefined) updateData.level = req.body.level;
    if (req.body.coins !== undefined) updateData.coins = req.body.coins;
    if (req.body.profileImage !== undefined) updateData.profileImage = req.body.profileImage;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.freeTrial !== undefined) updateData.freeTrial = req.body.freeTrial;
    if (req.body.password) {
      updateData.passwordHash = await serviceHashPassword(req.body.password);
    }

    const updatedUser = await serviceUpdateUser(req.user._id, updateData);

    const token = generateToken(updatedUser._id);
    setTokenCookie(res, token);

   if(updatedUser){
     res.json({
      message: "Your profile has been successfully updated!",
      ...serviceFormatUserResponse(updatedUser)
    });
   }

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCoinBalance = async (req, res) => {
  try {
    const user = await serviceGetUserById(req.user._id);
    if(user)
    {
 res.json({
      success: true,
      message: 'Coin balance retrieved successfully',
      data: {
        coins: user.coins
      }
    });
    }
   
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getCoinTransactions = async (req, res) => {
  try {
    const transactions = await CoinTransaction.find({ userId: req.user._id }) 
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      message: 'Coin transactions retrieved successfully',
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const sendCoins = async (req, res) => {
  try {
    const { recipientId, amount, note } = req.body;
    const UserId = req.user._id;

    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and positive amount are required'
      });
    }

    const sender = await User.findById(UserId);
    if (sender.coins < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient coins'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    if (sender._id.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send coins to yourself'
      });
    }

    sender.coins -= amount;
    recipient.coins += amount;

    await sender.save();
    await recipient.save();

    await CoinTransaction.create({
      userId: sender._id,
      type: 'debit',
      amount: amount,
      reason: 'user_transfer',
      description: note || `Sent ${amount} coins to ${recipient.username}`,
      relatedUserId: recipient._id
    });

    await CoinTransaction.create({
      userId: recipient._id,
      type: 'credit',
      amount: amount,
      reason: 'user_transfer',
      description: note || `Received ${amount} coins from ${sender.username}`,
      relatedUserId: sender._id
    });

    res.json({
      success: true,
      message: `Successfully sent ${amount} coins to ${recipient.username}`,
      data: {
        senderNewBalance: sender.coins,
        recipientUsername: recipient.username,
        amount: amount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await serviceGetAllUsers();
    res.json({
      message: `Retrieved ${users.length} users successfully`,
      count: users.length,
      users: users.map(user => serviceFormatUserResponse(user))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};