import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.config.js';
import env from '../utils/env.js';
import { COIN_RULES } from '../utils/constants.js';
import generateToken, { setTokenCookie, clearTokenCookie } from '../utils/tokenGenerator.js';
import { formatUserResponse, comparePassword, successResponse, errorResponse } from '../utils/helpers.js';
import { saveUserToDatabase, saveUserUpdateToDatabase, saveUserDeletionToDatabase, saveUserDeactivationToDatabase } from '../services/user.service.js';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

//  AUTHENTICATION 
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // All checking in controller
    const existingEmail = await prisma.user.findFirst({ where: { email } });
    if (existingEmail) {
      return errorResponse(res, 'Email already exists.', null, 400);
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      return errorResponse(res, 'Phone already exists.', null, 400);
    }

    const hashedPassword = await hashPassword(password);

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      roles: ['user'],
      coins: COIN_RULES.WELCOME_BONUS || 0,
      isActive: true,
      isEmailVerified: false
    };

    const user = await saveUserToDatabase(userData);

    if (COIN_RULES.WELCOME_BONUS > 0) {
      await prisma.coinTransaction.create({
        data: {
          userId: user.id,
          type: 'credit',
          amount: COIN_RULES.WELCOME_BONUS,
          Reason: 'welcome_bonus',
          description: `Welcome bonus of ${COIN_RULES.WELCOME_BONUS} coins`
        }
      });
    }

    return successResponse(res, 'Registration successful! Please login.', { user: formatUserResponse(user) }, 201);
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account deactivated. Contact admin.', null, 401);
    }

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    return successResponse(res, 'Login successful!', { token, user: formatUserResponse(user) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, 'Logout successful!');
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const resetToken = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '1h' });

    return successResponse(res, 'Password reset link sent.', { resetToken });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, env.jwtSecret);
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    return successResponse(res, 'Password reset successful.');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const isPasswordMatch = await comparePassword(currentPassword, user.password);
    if (!isPasswordMatch) {
      return errorResponse(res, 'Current password is incorrect.', null, 401);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  USER PROFILE 

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.user.id } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    return successResponse(res, 'Profile retrieved.', { user: formatUserResponse(user) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, profileImage } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return successResponse(res, 'Profile updated.', { user: formatUserResponse(updatedUser) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    clearTokenCookie(res);

    return successResponse(res, 'Account deactivated successfully.');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET USERS BY ID OR USERNAME

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.roles;

    // Check if user is admin or super_admin
    const isAdmin = currentUserRole.includes('admin') || currentUserRole.includes('super_admin');

    // If not admin, user can only see their own profile
    if (!isAdmin && currentUserId !== userId) {
      return errorResponse(res, 'You are not authorized to view this user', null, 403);
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    return successResponse(res, 'User retrieved.', { user: formatUserResponse(user) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.roles;

    // Check if user is admin or super_admin
    const isAdmin = currentUserRole.includes('admin') || currentUserRole.includes('super_admin');

    // First find the user by username
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: username },
          { lastName: username }
        ]
      }
    });

    if (!targetUser) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    // If not admin, user can only see their own profile
    if (!isAdmin && currentUserId !== targetUser.id) {
      return errorResponse(res, 'You are not authorized to view this user', null, 403);
    }

    return successResponse(res, 'User retrieved.', { user: formatUserResponse(targetUser) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN 

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.roles = { has: role };
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return successResponse(res, `Retrieved ${users.length} users.`, {
      users: users.map(user => formatUserResponse(user)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    return successResponse(res, 'User status updated.', {
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    await prisma.user.delete({ where: { id: userId } });

    return successResponse(res, 'User deleted successfully.');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};