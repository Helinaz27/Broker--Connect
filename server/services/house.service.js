import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveHouseToDatabase = async (houseData) => {
  return await prisma.houseListing.create({
    data: houseData
  });
};

//   READ 
export const findHouseById = async (id) => {
  return await prisma.houseListing.findUnique({
    where: { id }
  });
};

export const findHousesByOwner = async (ownerId) => {
  return await prisma.houseListing.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' }
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

export const findHousesByLocation = async (city, skip, take) => {
  return await prisma.houseListing.findMany({
    where: {
      status: 'active',
      location: {
        path: 'city',
        equals: city
      }
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countHousesByLocation = async (city) => {
  return await prisma.houseListing.count({
    where: {
      status: 'active',
      location: {
        path: 'city',
        equals: city
      }
    }
  });
};

//  UPDATE 
export const updateHouseInDatabase = async (id, updateData) => {
  return await prisma.houseListing.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deleteHouseFromDatabase = async (id) => {
  return await prisma.houseListing.delete({
    where: { id }
  });
};