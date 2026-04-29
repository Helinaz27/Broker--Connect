import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveContactAccessToDatabase = async (accessData) => {
  return await prisma.contactAccess.create({
    data: accessData
  });
};

//  READ 
export const findAccessByViewerAndListing = async (viewerId, listingId) => {
  return await prisma.contactAccess.findFirst({
    where: {
      viewerId,
      listingId,
      isActive: true
    }
  });
};

export const findAccessByViewer = async (viewerId, skip, take) => {
  return await prisma.contactAccess.findMany({
    where: { viewerId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countAccessByViewer = async (viewerId) => {
  return await prisma.contactAccess.count({ where: { viewerId } });
};

export const findAccessByListing = async (listingId, skip, take) => {
  return await prisma.contactAccess.findMany({
    where: { listingId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countAccessByListing = async (listingId) => {
  return await prisma.contactAccess.count({ where: { listingId } });
};

export const findAllContactAccesses = async (skip, take, orderBy) => {
  return await prisma.contactAccess.findMany({
    skip,
    take,
    orderBy
  });
};

export const countAllContactAccesses = async () => {
  return await prisma.contactAccess.count();
};

//  UPDATE 
export const updateContactAccessInDatabase = async (id, updateData) => {
  return await prisma.contactAccess.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deleteContactAccessFromDatabase = async (id) => {
  return await prisma.contactAccess.delete({
    where: { id }
  });
};