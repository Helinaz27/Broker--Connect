import { prisma } from '../config/db.config.js';


export const saveKYCToDatabase = async (kycData) => {
  return await prisma.kYCRequest.create({
    data: kycData
  });
};

export const updateKYCInDatabase = async (requestId, updateData) => {
  return await prisma.kYCRequest.update({
    where: { id: requestId },
    data: updateData
  });
};

