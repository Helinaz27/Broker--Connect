import { prisma } from '../config/db.config.js';
import { formatUserResponse, comparePassword, hashPassword } from '../utils/helpers.js';
import generateToken from '../utils/tokenGenerator.js';
import jwt from 'jsonwebtoken';
import env from '../utils/env.js';
import { COIN_RULES } from '../utils/constants.js';

export const registerUserService = async (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  const existingEmail = await prisma.user.findFirst({ where: { email } });
  if (existingEmail) {
    return { success: false, message: 'Email already exists.', status: 400 };
  }

  const existingPhone = await prisma.user.findFirst({ where: { phone } });
  if (existingPhone) {
    return { success: false, message: 'Phone already exists.', status: 400 };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      roles: ['user'],
      coins: COIN_RULES.WELCOME_BONUS || 0,
      isActive: true,
      isKYCVerified: false
    }
  });

  if (COIN_RULES.WELCOME_BONUS > 0) {
    await prisma.coinTransaction.create({
      data: {
        userId: newUser.id,
        type: 'credit',
        amount: COIN_RULES.WELCOME_BONUS,
        reason: 'welcome_bonus',
        description: `Welcome bonus of ${COIN_RULES.WELCOME_BONUS} coins`
      }
    });
  }

  return {
    success: true,
    message: 'Registration successful! Please login.',
    data: { user: formatUserResponse(newUser) },
    status: 201
  };
};

export const loginUserService = async (email, password) => {
  const user = await prisma.user.findFirst({ where: { email } });
  
  if (!user) {
    return { success: false, message: 'user not found already registered by this email ', status: 401 };
  }
  
  if (!user.isActive) {
    return { success: false, message: 'Account deactivated. Contact admin.', status: 401 };
  }
  
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    return { success: false, message: 'please try to use correct password', status: 401 };
  }
  
  const token = generateToken(user.id);
  
  return {
    success: true,
    message: 'Login successful!',
    data: { token, user: formatUserResponse(user) },
    status: 200
  };
};

export const logoutUserService = async () => {
  return { success: true, message: 'Logout successful!', status: 200 };
};

export const forgotPasswordUserService = async (email) => {
  const user = await prisma.user.findFirst({ where: { email } });
  
  if (!user) {
    return { success: false, message: 'User not found.', status: 404 };
  }
  
  const resetToken = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '1h' });
  
  return {
    success: true,
    message: 'Password reset link sent.',
    data: { resetToken },
    status: 200
  };
};

export const resetPasswordUserService = async (token, newPassword) => {
  const decoded = jwt.verify(token, env.jwtSecret);
  const hashedPassword = await hashPassword(newPassword);
  
  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashedPassword }
  });
  
  return { success: true, message: 'Password reset successful.', status: 200 };
};

export const changePasswordUserService = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  
  if (!user) {
    return { success: false, message: 'User not found.', status: 404 };
  }
  
  const isPasswordMatch = await comparePassword(currentPassword, user.password);
  if (!isPasswordMatch) {
    return { success: false, message: 'Current password is incorrect.', status: 401 };
  }
  
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
  
  return { success: true, message: 'Password changed successfully.', status: 200 };
};

export const getProfileUserService = async (userId) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  
  if (!user) {
    return { success: false, message: 'User not found.', status: 404 };
  }
  
  return {
    success: true,
    message: 'Profile retrieved.',
    data: { user: formatUserResponse(user) },
    status: 200
  };
};

export const updateProfileUserService = async (userId, updateData) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  return {
    success: true,
    message: 'Profile updated.',
    data: { user: formatUserResponse(updatedUser) },
    status: 200
  };
};

export const getUserByIdService = async (userId, currentUserId, currentUserRole) => {
  const isAdmin = currentUserRole.includes('admin');
  
  if (!isAdmin && currentUserId !== userId) {
    return { success: false, message: 'You are not authorized to view this user', status: 403 };
  }
  
  const user = await prisma.user.findFirst({ where: { id: userId } });
  
  if (!user) {
    return { success: false, message: 'User not found.', status: 404 };
  }
  
  return {
    success: true,
    message: 'User retrieved.',
    data: { user: formatUserResponse(user) },
    status: 200
  };
};


export const getAllUsersService = async (page, limit, search, role, isActive) => {
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
  
  return {
    success: true,
    message: `Retrieved ${users.length} users.`,
    data: {
      users: users.map(user => formatUserResponse(user)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    },
    status: 200
  };
};

export const updateUserStatusService = async (userId, isActive) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive }
  });
  
  return {
    success: true,
    message: 'User status updated.',
    data: {
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    },
    status: 200
  };
};

export const deleteUserByAdminService = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
  
  return { success: true, message: 'User deleted successfully.', status: 200 };
};