import { prisma } from '../config/db.config.js';

//  CREATE 
export const saveChatRoomToDatabase = async (chatRoomData) => {
  return await prisma.chatRoom.create({
    data: chatRoomData
  });
};

export const saveMessageToDatabase = async (messageData) => {
  return await prisma.message.create({
    data: messageData
  });
};

//  READ 
export const findChatRoomById = async (id) => {
  return await prisma.chatRoom.findUnique({
    where: { id }
  });
};

export const findChatRoomByParticipants = async (userId, participantId) => {
  return await prisma.chatRoom.findFirst({
    where: {
      AND: [
        { participants: { has: userId } },
        { participants: { has: participantId } }
      ]
    }
  });
};

export const findUserChatRooms = async (userId, skip, take) => {
  return await prisma.chatRoom.findMany({
    where: {
      participants: { has: userId }
    },
    skip,
    take,
    orderBy: { updatedAt: 'desc' }
  });
};

export const countUserChatRooms = async (userId) => {
  return await prisma.chatRoom.count({
    where: { participants: { has: userId } }
  });
};

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

export const findAllChatRooms = async (skip, take, orderBy) => {
  return await prisma.chatRoom.findMany({
    skip,
    take,
    orderBy
  });
};

export const countAllChatRooms = async () => {
  return await prisma.chatRoom.count();
};

//  UPDATE 
export const updateChatRoomInDatabase = async (id, updateData) => {
  return await prisma.chatRoom.update({
    where: { id },
    data: updateData
  });
};

export const updateMessageInDatabase = async (id, updateData) => {
  return await prisma.message.update({
    where: { id },
    data: updateData
  });
};

//  DELETE 
export const deleteMessagesByRoom = async (roomId) => {
  return await prisma.message.deleteMany({
    where: { roomId }
  });
};

export const deleteChatRoomFromDatabase = async (id) => {
  return await prisma.chatRoom.delete({
    where: { id }
  });
};