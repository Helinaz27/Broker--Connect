import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveNotificationToDatabase = async (notificationData) => {
  return await prisma.notification.create({
    data: notificationData
  });
};

export const createBulkNotifications = async (notificationsData) => {
  return await prisma.notification.createMany({
    data: notificationsData
  });
};

// ADD THIS MISSING EXPORT
export const createNotification = async (notificationData) => {
  return await prisma.notification.create({
    data: notificationData
  });
};

//  READ 
export const findNotificationsByUser = async (userId, skip, take, isRead) => {
  const where = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  
  return await prisma.notification.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countNotificationsByUser = async (userId, isRead) => {
  const where = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  
  return await prisma.notification.count({ where });
};

export const countUnreadByUser = async (userId) => {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });
};

export const findNotificationById = async (id) => {
  return await prisma.notification.findUnique({
    where: { id }
  });
};

export const findNotificationByIdAndUser = async (id, userId) => {
  return await prisma.notification.findFirst({
    where: {
      id: id,
      userId: userId
    }
  });
};

export const findAllNotifications = async (skip, take, where, orderBy) => {
  return await prisma.notification.findMany({
    where,
    skip,
    take,
    orderBy
  });
};

export const countAllNotifications = async (where) => {
  return await prisma.notification.count({ where });
};

//  UPDATE 
export const updateNotificationInDatabase = async (id, updateData) => {
  return await prisma.notification.update({
    where: { id },
    data: updateData
  });
};

export const markAllAsReadByUser = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  });
};

//  DELETE 
export const deleteNotificationFromDatabase = async (id) => {
  return await prisma.notification.delete({
    where: { id }
  });
};

export const deleteAllNotificationsByUser = async (userId) => {
  return await prisma.notification.deleteMany({
    where: { userId }
  });
};