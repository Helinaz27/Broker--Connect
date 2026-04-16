import Payment from '../models/Payment.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { TRANSACTION_REASONS, COIN_RULES } from '../utils/constants.js';
import { createNotification } from './notificationController.js';

export const initiatePayment = async (req, res) => {
  try {
    const { amount, paymentMethod,transactionId } = req.body;
    console.log('Initiating payment with:', { amount, paymentMethod });

    
    if (!amount || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, payment method, and transaction ID are required'
      });
    }
    
    
    
    
    
    const payment = await Payment.create({
      userId: req.user._id,
      amountBirr: amount,
      coinsReceived: amount,
      paymentMethod: paymentMethod ||'telebirr',
      transactionId: transactionId,
      purpose: 'buy_coins',
      status: 'pending',
      paymentDetails: {
        requestedAt: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });

    res.status(201).json({
      success: true,
      message: 'payment for coins is successfully done',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amountBirr,
        coins: payment.coinsReceived,
        status: payment.status
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

export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment already ${payment.status}`
      });
    }

    payment.status = 'success';
    payment.completedAt = new Date();
    await payment.save();

    const user = await User.findById(payment.userId);
    user.coins += payment.coinsReceived;
    await user.save();

    await CoinTransaction.create({
      userId: payment.userId,
      type: 'credit',
      amount: payment.coinsReceived,
      reason: TRANSACTION_REASONS.PURCHASE,
      description: `Purchased ${payment.coinsReceived} coins for ${payment.amountBirr} Birr`,
      referenceId: payment._id,
      referenceModel: 'Payment'
    });

    await createNotification(
      payment.userId,
      'payment_success',
      'Payment Successful',
      `You have successfully added ${payment.coinsReceived} coins to your account`,
      { paymentId: payment._id, amount: payment.coinsReceived }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        coins: payment.coinsReceived,
        newBalance: user.coins,
        status: payment.status
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

export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Payment.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
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

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        id: 'telebirr',
        name: 'Telebirr',
        icon: 'telebirr-icon.png',
        supported: true,
        minAmount: 10,
        maxAmount: 10000,
        description: 'Pay using Telebirr mobile money'
      }
    ];
    
    res.json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: methods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const telebirrWebhook = async (req, res) => {
  try {
    const { transactionId, status, amount, reference, phoneNumber } = req.body;
    
    console.log('Telebirr webhook received:', { transactionId, status, amount });
    
    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.paymentDetails = {
      ...payment.paymentDetails,
      webhookReceivedAt: new Date(),
      webhookStatus: status,
      phoneNumber,
      reference
    };

    // Update payment status based on webhook
    if (status === 'success' || status === 'completed') {
      if (payment.status === 'pending') {
        payment.status = 'success';
        payment.completedAt = new Date();
        await payment.save();

        const user = await User.findById(payment.userId);
        user.coins += payment.coinsReceived;
        await user.save();

        await CoinTransaction.create({
          userId: payment.userId,
          type: 'credit',
          amount: payment.coinsReceived,
          reason: TRANSACTION_REASONS.PURCHASE,
          description: `Purchased ${payment.coinsReceived} coins via Telebirr`,
          referenceId: payment._id,
          referenceModel: 'Payment'
        });

        // Send notification
        await createNotification(
          payment.userId,
          'payment_success',
          'Payment Successful',
          `You have successfully added ${payment.coinsReceived} coins to your account`,
          { paymentId: payment._id, amount: payment.coinsReceived }
        );
      }
    } else if (status === 'failed' || status === 'cancelled') {
      payment.status = 'failed';
      await payment.save();
      
      // Notify user of failed payment
      await createNotification(
        payment.userId,
        'payment_failed',
        'Payment Failed',
        `Your payment of ${payment.amountBirr} Birr failed. Please try again.`,
        { paymentId: payment._id }
      );
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, fromDate, toDate } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const payments = await Payment.find(filter)
      .populate('userId', 'username firstname lastname email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Payment.countDocuments(filter);
    
    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: {
        _id: null,
        totalAmount: { $sum: '$amountBirr' },
        totalCoins: { $sum: '$coinsReceived' },
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      message: 'All payments retrieved successfully',
      data: payments,
      statistics: stats[0] || { totalAmount: 0, totalCoins: 0, count: 0 },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
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