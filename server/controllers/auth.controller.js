import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import env from '../utils/env.js';
import { COIN_RULES, TRANSACTION_REASONS } from '../utils/constants.js'; 
import generateToken, { setTokenCookie, clearTokenCookie } from '../utils/tokenGenerator.js';


import { 
  hashPassword as serviceHashPassword, 
  comparePassword as serviceComparePassword, 
  checkUserExistsByEmail as serviceCheckUserExistsByEmail, 
  checkUsernameExists as serviceCheckUsernameExists,
  formatUserResponse as serviceFormatUserResponse 
} from '../services/userService.js';

import { validateRegister, validateLogin } from '../validations/userValidation.js';



export const register = async (req, res) => {
  try {
    const { username, firstname, lastname, email, phone, password, profileImage } = req.body;

    const validation = validateRegister({
      username,
      firstname,
      lastname,
      email,
      phone,
      password,
      level: 0,
      coins: COIN_RULES.WELCOME_BONUS, 
      profileImage: profileImage || '',
      isActive: true,
      isEmailVerified: false,
      freeTrial: {
        used: false,
        availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Registration failed: ' + validation.errors.join(', ')
      });
    }

    const emailExists = await serviceCheckUserExistsByEmail(validation.email);
    if (emailExists) {
      return res.status(400).json({ 
        message: 'Registration failed: A user with this email already exists.' 
      });
    }

    const usernameExists = await serviceCheckUsernameExists(validation.username);
    if (usernameExists) {
      return res.status(400).json({ 
        message: 'Registration failed: Username already taken.' 
      });
    }

    const hashedPassword = await serviceHashPassword(validation.password);

    const user = await User.create({
      username: validation.username,
      firstname: validation.firstname,
      lastname: validation.lastname,
      email: validation.email,
      phone: validation.phone,
      passwordHash: hashedPassword,
      roles: ['user'],
      level: validation.level,
      coins: COIN_RULES.WELCOME_BONUS, 
      freeTrial: validation.freeTrial,
      isActive: validation.isActive,
      isEmailVerified: validation.isEmailVerified,
      profileImage: validation.profileImage
    });

    await CoinTransaction.create({
      userId: user._id,
      type: 'credit',
      amount: COIN_RULES.WELCOME_BONUS,
      reason: 'welcome_bonus',
      description: `Welcome bonus of ${COIN_RULES.WELCOME_BONUS} coins`
    });

    res.status(201).json({
      message: "Congratulations! You have successfully registered. Welcome aboard! Please login to continue.",
      user: serviceFormatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = validateLogin({email,password});
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Login failed: ' + validation.errors.join(', ')
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Login failed: Invalid email or password.' 
      });
    }

    const isPasswordMatch = await serviceComparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: 'Login failed: Invalid email or password.' 
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({ 
      token: token,
      message: "Great to see you again! You have successfully logged in.",
      ...serviceFormatUserResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'You have been successfully logged out. See you again soon!' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const resetToken = jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: '1h' });
    
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      data: { resetToken }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, env.jwtSecret);
    const hashedPassword = await serviceHashPassword(newPassword);
    
    await User.findByIdAndUpdate(decoded.id, {
      passwordHash: hashedPassword
    });
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

