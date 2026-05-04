import { successResponse, errorResponse } from '../utils/helpers.js';
import { prisma } from '../config/db.config.js';
import { COIN_RULES } from '../utils/constants.js';
import {
  savePaymentToDatabase,
  findPaymentById,
  findPaymentByIdAndUser,
  findPaymentsByUser,
  countPaymentsByUser,
  findAllPayments,
  countAllPayments,
  updatePaymentInDatabase
} from '../services/payment.service.js';

// Get coin price from constants
const EXCHANGE_RATE = COIN_RULES.COIN_PRICE_IN_BIRR; // 1 Birr = 1 Coin

//  HELPER FUNCTIONS 

const formatPaymentResponse = (payment, includeUser = false) => {
  const baseData = {
    id: payment.id,
    amountBirr: payment.amountBirr,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    status: payment.status,
    createdAt: payment.createdAt,
    completedAt: payment.completedAt
  };

  if (includeUser && payment.user) {
    baseData.user = {
      id: payment.user.id,
      firstName: payment.user.firstName,
      lastName: payment.user.lastName,
      email: payment.user.email,
      phone: payment.user.phone
    };
  }

  return baseData;
};

//  USER PAYMENT CONTROLLERS 

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { amountBirr, paymentMethod, transactionId } = req.body;

    // Check for duplicate transaction ID
    const existingTransaction = await prisma.payment.findFirst({
      where: {
        transactionId: transactionId,
        paymentMethod: paymentMethod
      }
    });

    if (existingTransaction) {
      return errorResponse(res, `Transaction ID ${transactionId} already exists for ${paymentMethod}. Please use a different transaction ID.`, null, 400);
    }

    const coinsReceived = amountBirr * EXCHANGE_RATE;

    const paymentData = {
      userId: userId,
      amountBirr: parseFloat(amountBirr),
      coinsReceived: coinsReceived,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      purpose: 'buy_coins',
      status: 'pending'
    };

    const payment = await savePaymentToDatabase(paymentData);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    const formattedPayment = formatPaymentResponse(payment, false);

    return successResponse(res, `Dear ${userFullName}, your payment of ${amountBirr} Birr for buying coins has been recorded. You will get ${coinsReceived} coins after admin verification.`, { 
      payment: formattedPayment,
      exchangeRate: `${EXCHANGE_RATE} Birr = 1 Coin`,
      currentBalance: {
        coins: user.coins,
        pendingCoins: coinsReceived,
        totalAfterConfirmation: user.coins + coinsReceived
      },
      nextSteps: {
        status: "Awaiting admin verification",
        message: "Admin will verify your payment and add coins to your account",
        estimatedTime: "Within 24 hours"
      }
    }, 201);
  } catch (error) {
    console.error('Create payment error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

// Add this function at the bottom of payment.controller.js

export const getCoinBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    return successResponse(res, 'Coin balance retrieved successfully', {
      coins: user.coins
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      findPaymentsByUser(userId, parseInt(skip), parseInt(limit), status),
      countPaymentsByUser(userId, status)
    ]);

const formattedPayments = payments.map(p => formatPaymentResponse(p, false));

    return successResponse(res, `Retrieved ${formattedPayments.length} payments`, {
      payments: formattedPayments,
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

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await findPaymentByIdAndUser(id, userId);

    if (!payment) {
      return errorResponse(res, 'Payment not found', null, 404);
    }

    const formattedPayment = formatPaymentResponse(payment, false);

    return successResponse(res, 'Payment retrieved successfully', { payment: formattedPayment });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN PAYMENT CONTROLLERS 

export const adminGetAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') where.status = status;

    const [payments, total] = await Promise.all([
      findAllPayments(parseInt(skip), parseInt(limit), where),
      countAllPayments(where)
    ]);

    const formattedPayments = payments.map(p => formatPaymentResponse(p, true));

    return successResponse(res, `Retrieved ${formattedPayments.length} payments`, {
      payments: formattedPayments,
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

export const adminGetPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await findPaymentById(id);

    if (!payment) {
      return errorResponse(res, 'Payment not found', null, 404);
    }

    const formattedPayment = formatPaymentResponse(payment, true);

    return successResponse(res, 'Payment retrieved successfully', { payment: formattedPayment });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingPayment = await findPaymentById(id);

    if (!existingPayment) {
      return errorResponse(res, 'Payment not found', null, 404);
    }

    if (existingPayment.status !== 'pending') {
      return errorResponse(res, 'This payment has already been processed', null, 400);
    }

    const updateData = {
      status: status,
      completedAt: status === 'success' ? new Date() : null
    };

    const updatedPayment = await updatePaymentInDatabase(id, updateData);

    if (status === 'success') {
      await prisma.user.update({
        where: { id: existingPayment.userId },
        data: { coins: { increment: existingPayment.coinsReceived } }
      });

      await prisma.coinTransaction.create({
        data: {
          userId: existingPayment.userId,
          type: 'credit',
          amount: existingPayment.coinsReceived,
          Reason: 'purchase',
          description: `Purchased ${existingPayment.coinsReceived} coins for ${existingPayment.amountBirr} Birr`
        }
      });

      await prisma.notification.create({
        data: {
          userId: existingPayment.userId,
          Type: 'payment_success',
          title: 'Payment Successful',
          body: `You have successfully purchased ${existingPayment.coinsReceived} coins.`,
          isRead: false
        }
      });
    }

    // ✅ CHANGE false to true
    const formattedPayment = formatPaymentResponse(updatedPayment, true);

    return successResponse(res, `Payment status updated to ${status} successfully`, {
      payment: formattedPayment
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};