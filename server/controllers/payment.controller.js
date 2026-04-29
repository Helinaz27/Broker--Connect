import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { COIN_RULES } from '../utils/constants.js';

//  USER PAYMENT CONTROLLERS 

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amountBirr, paymentMethod, transactionId } = req.body;

    // Calculate coins based on amount (example: 1 Birr = 1 coin)
    const coinsReceived = amountBirr * 10; // 1 Birr = 10 coins

    const paymentData = {
      userId: userId,
      amountBirr: parseFloat(amountBirr),
      coinsReceived: coinsReceived,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      purpose: 'buy_coins',
      status: 'pending'
    };

    const payment = await prisma.payment.create({
      data: paymentData
    });

    return successResponse(res, 'Payment created successfully. Awaiting confirmation.', { payment }, 201);
  } catch (error) {
    console.error('Create payment error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where: { userId } })
    ]);

    return successResponse(res, `Retrieved ${payments.length} payments`, {
      payments,
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

    const payment = await prisma.payment.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found', null, 404);
    }

    return successResponse(res, 'Payment retrieved successfully', { payment });
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
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    return successResponse(res, `Retrieved ${payments.length} payments`, {
      payments,
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

export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return errorResponse(res, 'Payment not found', null, 404);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: status,
        completedAt: status === 'success' ? new Date() : null
      }
    });

    // If payment is successful, add coins to user
    if (status === 'success' && existingPayment.status !== 'success') {
      await prisma.user.update({
        where: { id: existingPayment.userId },
        data: {
          coins: {
            increment: existingPayment.coinsReceived
          }
        }
      });

      // Create coin transaction record
      await prisma.coinTransaction.create({
        data: {
          userId: existingPayment.userId,
          type: 'credit',
          amount: existingPayment.coinsReceived,
          Reason: 'purchase',
          description: `Purchased ${existingPayment.coinsReceived} coins for ${existingPayment.amountBirr} Birr`
        }
      });
    }

    return successResponse(res, 'Payment status updated successfully', { payment: updatedPayment });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminGetPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where: { userId } })
    ]);

    return successResponse(res, `Retrieved ${payments.length} payments for user`, {
      payments,
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