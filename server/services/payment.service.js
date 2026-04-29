import { prisma } from '../config/db.config.js';

//  CREATE 
export const savePaymentToDatabase = async (paymentData) => {
  return await prisma.payment.create({
    data: paymentData
  });
};

//  READ 
export const findPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id }
  });
};

export const findPaymentByIdAndUser = async (id, userId) => {
  return await prisma.payment.findFirst({
    where: {
      id: id,
      userId: userId
    }
  });
};

export const findPaymentsByUser = async (userId, skip, take) => {
  return await prisma.payment.findMany({
    where: { userId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countPaymentsByUser = async (userId) => {
  return await prisma.payment.count({ where: { userId } });
};

export const findAllPayments = async (skip, take, where, orderBy) => {
  return await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countPayments = async (where) => {
  return await prisma.payment.count({ where });
};

//  UPDATE 
export const updatePaymentInDatabase = async (id, updateData) => {
  return await prisma.payment.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deletePaymentFromDatabase = async (id) => {
  return await prisma.payment.delete({
    where: { id }
  });
};