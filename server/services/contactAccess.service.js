import { prisma } from '../config/db.config.js';

export const saveContactAccessToDatabase = async (accessData) => {
  return await prisma.contactAccess.create({
    data: accessData
  });
};

export const findAccessByViewerAndListing = async (viewerId, listingId) => {
  return await prisma.contactAccess.findFirst({
    where: {
      viewerId: viewerId,
      listingId: listingId,
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
  return await prisma.contactAccess.count({
    where: { viewerId }
  });
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
  return await prisma.contactAccess.count({
    where: { listingId }
  });
};

export const findAllContactAccesses = async (skip, take) => {
  return await prisma.contactAccess.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countAllContactAccesses = async () => {
  return await prisma.contactAccess.count();
};

export const findAccessByUser = async (userId, skip, take) => {
  return await prisma.contactAccess.findMany({
    where: {
      OR: [
        { viewerId: userId },
        { ownerId: userId }
      ]
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countAccessByUser = async (userId) => {
  return await prisma.contactAccess.count({
    where: {
      OR: [
        { viewerId: userId },
        { ownerId: userId }
      ]
    }
  });
};