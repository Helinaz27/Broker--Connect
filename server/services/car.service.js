import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveCarToDatabase = async (carData) => {
  return await prisma.carListing.create({
    data: carData
  });
};

//  READ 
export const findCarById = async (id) => {
  return await prisma.carListing.findUnique({
    where: { id }
  });
};

export const findCarsByOwner = async (ownerId) => {
  return await prisma.carListing.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' }
  });
};

export const findAllCars = async (skip, take, where, orderBy) => {
  return await prisma.carListing.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countCars = async (where) => {
  return await prisma.carListing.count({ where });
};

export const findCarsByLocation = async (city, skip, take) => {
  return await prisma.carListing.findMany({
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

export const countCarsByLocation = async (city) => {
  return await prisma.carListing.count({
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
export const updateCarInDatabase = async (id, updateData) => {
  return await prisma.carListing.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deleteCarFromDatabase = async (id) => {
  return await prisma.carListing.delete({
    where: { id }
  });
};