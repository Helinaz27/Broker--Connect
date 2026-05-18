import { prisma } from '../config/db.config.js';

export const savePaymentToDatabase = async (paymentData) => {
  return await prisma.payment.create({ data: paymentData });
};

export const findPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

export const findPaymentByIdAndUser = async (id, userId) => {
  return await prisma.payment.findFirst({
    where: { id, userId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

export const findPaymentsByUser = async (userId, skip, take, status) => {
  const where = { userId };
  if (status && status !== 'all') where.status = status;
  return await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

export const countPaymentsByUser = async (userId, status) => {
  const where = { userId };
  if (status && status !== 'all') where.status = status;
  return await prisma.payment.count({ where });
};

export const findAllPayments = async (skip, take, where) => {
  return await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

export const countAllPayments = async (where) => {
  return await prisma.payment.count({ where });
};

export const updatePaymentInDatabase = async (id, updateData) => {
  return await prisma.payment.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

export const findPaymentByTransactionId = async (transactionId) => {
  return await prisma.payment.findUnique({
    where: { transactionId },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, coins: true } } },
  });
};

export const creditCoinsAfterPayment = async (payment) => {
  return await prisma.$transaction([
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
    prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'payment_success',
        title: 'Payment Successful',
        body: `You have successfully purchased ${payment.coinsReceived} coins via Chapa payment.`,
        isRead: false,
      },
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success', completedAt: new Date() },
    }),
  ]);
};

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
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, coins: true },
      },
    },
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
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.payment.count({ where: filters }),
  ]);
  return { payments, total };
};