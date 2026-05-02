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

export const findAllCars = async () => {
  return await prisma.carListing.findMany({});
};

export const findAllActiveCars = async () => {
  return await prisma.carListing.findMany({
    where: { status: 'active' }
  });
};

//  UPDATE 
export const updateCarInDatabase = async (id, updateData) => {
  return await prisma.carListing.update({
    where: { id },
    data: updateData
  });
};