import { prisma } from '../config/db.config.js';

export const createListing = async (listingData) => {
  return await prisma.listing.create({
    data: listingData
  });
};

export const getListingById = async (id) => {
  return await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } }
  });
};

export const getAllListings = async () => {
  return await prisma.listing.findMany({
    include: { owner: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } }
  });
};

export const getAllActiveListings = async () => {
  return await prisma.listing.findMany({
    where: { status: 'active' },
    include: { owner: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } }
  });
};

export const updateListing = async (id, updateData) => {
  return await prisma.listing.update({
    where: { id },
    data: updateData,
    include: { owner: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } }
  });
};