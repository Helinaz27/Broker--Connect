import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveServiceToDatabase = async (serviceData) => {
  return await prisma.serviceListing.create({
    data: serviceData
  });
};

//  READ 
export const findServiceById = async (id) => {
  return await prisma.serviceListing.findUnique({
    where: { id }
  });
};

export const findAllServices = async () => {
  return await prisma.serviceListing.findMany({});
};

export const findAllActiveServices = async () => {
  return await prisma.serviceListing.findMany({
    where: { status: 'active' }
  });
};

//  UPDATE 
export const updateServiceInDatabase = async (id, updateData) => {
  return await prisma.serviceListing.update({
    where: { id },
    data: updateData
  });
};