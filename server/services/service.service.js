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

export const findServicesByOwner = async (ownerId) => {
  return await prisma.serviceListing.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' }
  });
};

export const findAllServices = async (skip, take, where, orderBy) => {
  return await prisma.serviceListing.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countServices = async (where) => {
  return await prisma.serviceListing.count({ where });
};

export const findServicesByLocation = async (city, skip, take) => {
  return await prisma.serviceListing.findMany({
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

export const countServicesByLocation = async (city) => {
  return await prisma.serviceListing.count({
    where: {
      status: 'active',
      location: {
        path: 'city',
        equals: city
      }
    }
  });
};

export const findServicesByType = async (serviceType, skip, take) => {
  return await prisma.serviceListing.findMany({
    where: {
      status: 'active',
      serviceType: serviceType
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countServicesByType = async (serviceType) => {
  return await prisma.serviceListing.count({
    where: {
      status: 'active',
      serviceType: serviceType
    }
  });
};

//  UPDATE 
export const updateServiceInDatabase = async (id, updateData) => {
  return await prisma.serviceListing.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deleteServiceFromDatabase = async (id) => {
  return await prisma.serviceListing.delete({
    where: { id }
  });
};