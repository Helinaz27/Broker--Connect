import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  USER COIN TRANSACTION CONTROLLERS 

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coinTransaction.count({ where })
    ]);

    return successResponse(res, `Retrieved ${transactions.length} transactions`, {
      transactions,
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

export const getMyBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    return successResponse(res, 'Balance retrieved successfully', {
      coins: user.coins
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN COIN TRANSACTION CONTROLLERS 

export const adminGetAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coinTransaction.count({ where })
    ]);

    return successResponse(res, `Retrieved ${transactions.length} transactions`, {
      transactions,
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

export const adminGetTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where: { userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coinTransaction.count({ where: { userId } })
    ]);

    return successResponse(res, `Retrieved ${transactions.length} transactions for user`, {
      transactions,
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