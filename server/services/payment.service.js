import { prisma } from '../config/db.config.js';

export const savePaymentToDatabase = async (paymentData) => {
  return await prisma.payment.create({ data: paymentData });
};

export const findPaymentById = async (id) => {
  return await prisma.payment.findUnique({ where: { id } });
};

export const findPaymentByIdAndUser = async (id, userId) => {
  return await prisma.payment.findFirst({
    where: { id: id, userId: userId }
  });
};

export const findPaymentsByUser = async (userId, skip, take, status) => {
  const where = { userId };
  if (status && status !== 'all') where.status = status;
  return await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
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
    orderBy: { createdAt: 'desc' }
  });
};

export const countAllPayments = async (where) => {
  return await prisma.payment.count({ where });
};

export const updatePaymentInDatabase = async (id, updateData) => {
  return await prisma.payment.update({
    where: { id },
    data: updateData
  });
};