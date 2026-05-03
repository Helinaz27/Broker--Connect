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

export const findAllPostingFees = async (skip, take) => {
  return await prisma.postingFee.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countAllPostingFees = async () => {
  return await prisma.postingFee.count();
};

export const findPostingFeesByFilter = async (where, skip, take) => {
  return await prisma.postingFee.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};


export const countPostingFeesByFilter = async (where) => {
  return await prisma.postingFee.count({ where });
};

export const findActivePostingFeeByCategory = async (category) => {
  return await prisma.postingFee.findFirst({
    where: {
      category,
      isActive: true
    }
  });
};

//  UPDATE 
export const updatePostingFeeInDatabase = async (id, updateData) => {
  return await prisma.postingFee.update({
    where: { id },
    data: updateData
  });
};