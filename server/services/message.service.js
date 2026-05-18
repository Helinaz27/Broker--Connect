import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveMessageToDatabase = async (messageData) => {
  return await prisma.message.create({
    data: messageData
  });
};

//  READ 
export const findMessagesByRoom = async (roomId, skip, take) => {
  return await prisma.message.findMany({
    where: { roomId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};

export const countMessagesByRoom = async (roomId) => {
  return await prisma.message.count({ where: { roomId } });
};

export const findMessageById = async (id) => {
  return await prisma.message.findUnique({
    where: { id }
  });
};

export const findUnreadMessagesByUser = async (userId, roomId) => {
  const where = {
    readBy: {
      none: { userId: userId }
    },
    senderId: { not: userId }
  };
  
  if (roomId) where.roomId = roomId;
  
  return await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'asc' }
  });
};

export const countUnreadMessagesByUser = async (userId, roomId) => {
  const where = {
    readBy: {
      none: { userId: userId }
    },
    senderId: { not: userId }
  };
  
  if (roomId) where.roomId = roomId;
  
  return await prisma.message.count({ where });
};

//  UPDATE 
export const updateMessageInDatabase = async (id, updateData) => {
  return await prisma.message.update({
    where: { id },
    data: updateData
  });
};

export const markMessageAsReadByUser = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });
  
  if (!message) return null;
  
  const alreadyRead = message.readBy.some(read => read.userId === userId);
  
  if (alreadyRead) return message;
  
  return await prisma.message.update({
    where: { id: messageId },
    data: {
      readBy: {
        push: { userId, readAt: new Date() }
      }
    }
  });
};

//  DELETE 
export const deleteMessageFromDatabase = async (id) => {
  return await prisma.message.delete({
    where: { id }
  });
};

export const deleteMessagesByRoom = async (roomId) => {
  return await prisma.message.deleteMany({
    where: { roomId }
  });
};