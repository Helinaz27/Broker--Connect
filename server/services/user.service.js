// services/user.service.js
import { prisma } from '../config/db.config.js';

// ONLY ONE JOB - save to database
export const saveUserToDatabase = async (userData) => {
  return await prisma.user.create({ data: userData });
};

export const saveUserUpdateToDatabase = async (id, updateData) => {
  return await prisma.user.update({ where: { id }, data: updateData });
};

export const saveUserDeletionToDatabase = async (id) => {
  return await prisma.user.delete({ where: { id } });
};

export const saveUserDeactivationToDatabase = async (id) => {
  return await prisma.user.update({ where: { id }, data: { isActive: false } });
};