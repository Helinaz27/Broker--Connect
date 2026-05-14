import { prisma } from '../config/db.config.js';

// ─── EXISTING SERVICES (unchanged) ───────────────────────────────────────────

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

// ─── NEW CHAPA-SPECIFIC SERVICES ─────────────────────────────────────────────

// Find payment by transactionId (tx_ref) — used in Chapa callback
export const findPaymentByTransactionId = async (transactionId) => {
  return await prisma.payment.findUnique({
    where: { transactionId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
};

// Credit coins + create CoinTransaction + create Notification — all in one Prisma transaction
export const creditCoinsAfterPayment = async (payment) => {
  return await prisma.$transaction([
    // 1. Update user coins
    prisma.user.update({
      where: { id: payment.userId },
      data: { coins: { increment: payment.coinsReceived } },
    }),

    // 2. Record coin transaction
    prisma.coinTransaction.create({
      data: {
        userId: payment.userId,
        type: 'credit',
        amount: payment.coinsReceived,
        reason: 'purchase',
        description: `Purchased ${payment.coinsReceived} coins for ${payment.amountBirr} Birr via Chapa`,
      },
    }),

    // 3. Notify user
    prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'payment_success',
        title: 'Payment Successful',
        body: `You have successfully purchased ${payment.coinsReceived} coins via Chapa payment.`,
        isRead: false,
      },
    }),

    // 4. Mark payment as success
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success', completedAt: new Date() },
    }),
  ]);
};

// Mark payment as failed
export const markPaymentFailed = async (paymentId) => {
  return await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'failed', completedAt: new Date() },
  });
};