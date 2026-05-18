import { prisma } from '../config/db.config.js';

export const createPendingPayment = async ({ userId, amountBirr, coinsReceived, transactionId }) => {
  return await prisma.payment.create({
    data: {
      userId,
      amountBirr,
      coinsReceived,
      paymentMethod: 'chapa',
      transactionId,
      status: 'pending',
    },
  });
};

export const getPaymentByTxRef = async (transactionId) => {
  return await prisma.payment.findUnique({
    where: { transactionId },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, coins: true } } },
  });
};

export const creditCoinsToUser = async ({ transactionId, userId, coinsReceived, amountBirr }) => {
  return await prisma.$transaction([
    prisma.payment.update({
      where: { transactionId },
      data: { status: 'success', completedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: coinsReceived } },
    }),
    prisma.coinTransaction.create({
      data: {
        userId,
        type: 'credit',
        amount: coinsReceived,
        reason: 'coin_purchase',
        description: `Purchased ${coinsReceived} coins via Chapa for ${amountBirr} ETB`,
      },
    }),
  ]);
};

export const markPaymentFailed = async (transactionId) => {
  return await prisma.payment.update({
    where: { transactionId },
    data: { status: 'failed' },
  });
};

export const getPaginatedPayments = async ({ filters = {}, page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: filters,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.payment.count({ where: filters }),
  ]);
  return { payments, total };
};