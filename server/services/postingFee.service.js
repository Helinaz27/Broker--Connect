import { prisma } from '../config/db.config.js';

//  CREATE 
export const savePostingFeeToDatabase = async (postingFeeData) => {
  return await prisma.postingFee.create({
    data: postingFeeData
  });
};

//  READ 
export const findPostingFeeById = async (id) => {
  return await prisma.postingFee.findUnique({
    where: { id }
  });
};

export const findAllPostingFees = async (skip, take, where, orderBy) => {
  return await prisma.postingFee.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countPostingFees = async (where) => {
  return await prisma.postingFee.count({ where });
};

export const findActivePostingFees = async () => {
  return await prisma.postingFee.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' }
  });
};

export const findPostingFeesByCategory = async (category) => {
  return await prisma.postingFee.findMany({
    where: {
      category: category,
      isActive: true
    },
    orderBy: { durationDays: 'asc' }
  });
};

//  UPDATE 
export const updatePostingFeeInDatabase = async (id, updateData) => {
  return await prisma.postingFee.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deletePostingFeeFromDatabase = async (id) => {
  return await prisma.postingFee.delete({
    where: { id }
  });
};