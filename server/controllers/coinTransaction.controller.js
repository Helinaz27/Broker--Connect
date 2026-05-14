import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  findTransactionsByUser,
  countTransactionsByUser,
  findTransactionByIdAndUser,
  findAllTransactions,
  countAllTransactions,
  findTransactionsByUserForAdmin,
  countTransactionsByUserForAdmin,
  findTransactionById
} from '../services/coinTransaction.service.js';


const formatTransactionResponse = (transaction, includeUser = false) => {
  const baseData = {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    reason: transaction.Reason,
    description: transaction.description,
    createdAt: transaction.createdAt
  };

  if (includeUser && transaction.user) {
    baseData.user = {
      id: transaction.user.id,
      firstName: transaction.user.firstName,
      lastName: transaction.user.lastName,
      email: transaction.user.email,
      phone: transaction.user.phone
    };
  }

  return baseData;
};


export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, reason } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      findTransactionsByUser(userId, parseInt(skip), parseInt(limit), type, reason),
      countTransactionsByUser(userId, type, reason)
    ]);

    const formattedTransactions = transactions.map(t => formatTransactionResponse(t, false));

    return successResponse(res, `Retrieved ${formattedTransactions.length} transactions`, {
      transactions: formattedTransactions,
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

export const getMyTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await findTransactionByIdAndUser(id, userId);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', null, 404);
    }

    const formattedTransaction = formatTransactionResponse(transaction, false);

    return successResponse(res, 'Transaction retrieved successfully', { transaction: formattedTransaction });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};


export const adminGetAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, reason, userId } = req.query;
    const skip = (page - 1) * limit;

    let transactions, total;

    if (userId) {
      [transactions, total] = await Promise.all([
        findTransactionsByUserForAdmin(userId, parseInt(skip), parseInt(limit), type, reason),
        countTransactionsByUserForAdmin(userId, type, reason)
      ]);
    } else {
      [transactions, total] = await Promise.all([
        findAllTransactions(parseInt(skip), parseInt(limit), type, reason),
        countAllTransactions(type, reason)
      ]);
    }

    const formattedTransactions = transactions.map(t => formatTransactionResponse(t, true));

    return successResponse(res, `Retrieved ${formattedTransactions.length} transactions`, {
      transactions: formattedTransactions,
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

export const adminGetTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await findTransactionById(id);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', null, 404);
    }

    const formattedTransaction = formatTransactionResponse(transaction, true);

    return successResponse(res, 'Transaction retrieved successfully', { transaction: formattedTransaction });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminGetTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, reason } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      findTransactionsByUserForAdmin(userId, parseInt(skip), parseInt(limit), type, reason),
      countTransactionsByUserForAdmin(userId, type, reason)
    ]);

    const formattedTransactions = transactions.map(t => formatTransactionResponse(t, false));

    return successResponse(res, `Retrieved ${formattedTransactions.length} transactions for user`, {
      transactions: formattedTransactions,
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