import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveCoinTransactionToDatabase = async (transactionData) => {
  return await prisma.coinTransaction.create({
    data: transactionData
  });
};

//  READ 
export const findTransactionsByUser = async (userId, skip, take, type) => {
  const where = { userId };
  if (type) where.type = type;
  
  return await prisma.coinTransaction.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countTransactionsByUser = async (userId, type) => {
  const where = { userId };
  if (type) where.type = type;
  
  return await prisma.coinTransaction.count({ where });
};

export const findAllTransactions = async (skip, take, where, orderBy) => {
  return await prisma.coinTransaction.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countAllTransactions = async (where) => {
  return await prisma.coinTransaction.count({ where });
};

export const findUserBalance = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true }
  });
  return user?.coins || 0;
};

