import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveHouseToDatabase = async (houseData) => {
  return await prisma.houseListing.create({
    data: houseData
  });
};

//  READ 
export const findHouseById = async (id) => {
  return await prisma.houseListing.findUnique({
    where: { id }
  });
};

export const findHouseByIdAndOwner = async (id, ownerId) => {
  return await prisma.houseListing.findFirst({
    where: { id, ownerId }
  });
};

export const findHousesByOwner = async (ownerId, skip, take) => {
  return await prisma.houseListing.findMany({
    where: { ownerId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countHousesByOwner = async (ownerId) => {
  return await prisma.houseListing.count({
    where: { ownerId }
  });
};

export const findAllHouses = async (skip, take, where, orderBy) => {
  return await prisma.houseListing.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countHouses = async (where) => {
  return await prisma.houseListing.count({ where });
};

export const findHousesByType = async (houseType, skip, take) => {
  return await prisma.houseListing.findMany({
    where: {
      houseType,
      status: 'active'
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countHousesByType = async (houseType) => {
  return await prisma.houseListing.count({
    where: {
      houseType,
      status: 'active'
    }
  });
};

export const findHousesByPriceRange = async (min, max, skip, take) => {
  return await prisma.houseListing.findMany({
    where: {
      status: 'active',
      price: {
        gte: min,
        lte: max
      }
    },
    skip,
    take,
    orderBy: { price: 'asc' }
  });
};

export const countHousesByPriceRange = async (min, max) => {
  return await prisma.houseListing.count({
    where: {
      status: 'active',
      price: {
        gte: min,
        lte: max
      }
    }
  });
};

// For city filtering (in memory due to nested location structure)
export const getAllActiveHouses = async () => {
  return await prisma.houseListing.findMany({
    where: { status: 'active' }
  });
};

export const getAllHousesForAdmin = async () => {
  return await prisma.houseListing.findMany({});
};

//  UPDATE 
export const updateHouseInDatabase = async (id, updateData) => {
  return await prisma.houseListing.update({
    where: { id },
    data: updateData
  });
};

export const updateHouseStatusInDatabase = async (id, status) => {
  return await prisma.houseListing.update({
    where: { id },
    data: { status }
  });
};

export const findAllActiveHouses = async () => {
  return await prisma.houseListing.findMany({
    where: { status: 'active' }
  });
};

