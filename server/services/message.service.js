import { prisma } from '../config/db.config.js';

export const sendMessageService = async (roomId, senderId, content, messageType, listingId) => {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) throw { status: 404, message: 'Chat room not found' };

  if (!room.participants.includes(senderId)) {
    throw { status: 403, message: 'You are not a participant of this room' };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw { status: 404, message: 'Listing not found' };

  const message = await prisma.message.create({
    data: {
      roomId,
      senderId,
      listingId,
      content,
      messageType: messageType || 'text',
      isRead: false,
    },
  });

  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: room.participants.find((id) => id !== senderId),
      type: 'new_message',
      title: 'New Message',
      body: messageType === 'text' ? content : `Sent a ${messageType}`,
      path: `/chat/${roomId}`,
      referenceId: message.id,
    },
  });

  return message;
};

export const getMessagesService = async (userId, roomId, page, limit) => {
  const skip = (page - 1) * limit;

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) throw { status: 404, message: 'Chat room not found' };

  if (!room.participants.includes(userId)) {
    throw { status: 403, message: 'You are not a participant of this room' };
  }

  await prisma.message.updateMany({
    where: { roomId, isRead: false, senderId: { not: userId } },
    data: { isRead: true },
  });

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { roomId } }),
  ]);

  return { messages, total };
};

export const adminGetAllMessagesService = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count(),
  ]);

  return { messages, total };
};

export const adminGetRoomMessagesService = async (roomId, page, limit) => {
  const skip = (page - 1) * limit;

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) throw { status: 404, message: 'Chat room not found' };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { roomId } }),
  ]);

  return { messages, total };
};