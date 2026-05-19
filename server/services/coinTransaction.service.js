import { prisma } from '../config/db.config.js';

export const getMyTransactionsService = async (userId, page, limit) => {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coinTransaction.count({ where: { userId } }),
  ]);

  return { transactions, total };
};

export const adminGetAllTransactionsService = async (page, limit, type) => {
  const skip = (page - 1) * limit;

  const where = type ? { type } : {};

  const [transactions, total] = await Promise.all([
    prisma.coinTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coinTransaction.count({ where }),
  ]);

  return { transactions, total };
};

export const adminGetTransactionByIdService = async (id) => {
  const transaction = await prisma.coinTransaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profileImage: true,
        },
      },
    },
  });

  if (!transaction) throw { status: 404, message: 'Transaction not found' };

  return transaction;
};

export const adminGetTransactionsByUserService = async (userId, page, limit, type) => {
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 404, message: 'User not found' };

  const where = { userId, ...(type ? { type } : {}) };

  const [transactions, total] = await Promise.all([
    prisma.coinTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coinTransaction.count({ where }),
  ]);

  return { transactions, total };
};