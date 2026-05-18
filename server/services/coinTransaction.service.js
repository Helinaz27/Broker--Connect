import { prisma } from '../config/db.config.js';


//  CREATE 
export const saveCoinTransactionToDatabase = async (transactionData) => {
  return await prisma.coinTransaction.create({
    data: transactionData
  });
};

//  READ 
export const findTransactionById = async (id) => {
  return await prisma.coinTransaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });
};

export const findTransactionByIdAndUser = async (id, userId) => {
  return await prisma.coinTransaction.findFirst({
    where: { id: id, userId: userId }
  });
};

export const findTransactionsByUser = async (userId, skip, take, type, reason) => {
  const where = { userId };
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countTransactionsByUser = async (userId, type, reason) => {
  const where = { userId };
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.count({ where });
};

export const findAllTransactions = async (skip, take, type, reason) => {
  const where = {};
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });
};

export const countAllTransactions = async (type, reason) => {
  const where = {};
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.count({ where });
};

export const findTransactionsByUserForAdmin = async (userId, skip, take, type, reason) => {
  const where = { userId };
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });
};

export const countTransactionsByUserForAdmin = async (userId, type, reason) => {
  const where = { userId };
  if (type) where.type = type;
  if (reason) where.Reason = reason;
  
  return await prisma.coinTransaction.count({ where });
};
