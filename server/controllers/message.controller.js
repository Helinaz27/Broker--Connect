import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';


export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is in this chat room
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: { has: userId }
      }
    });

    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found or unauthorized', null, 404);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { roomId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({ where: { roomId } })
    ]);

    return successResponse(res, `Retrieved ${messages.length} messages`, {
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { content, messageType = 'text' } = req.body;

    // Verify user is in this chat room
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: { has: userId }
      }
    });

    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found or unauthorized', null, 404);
    }

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        content,
        messageType,
        readBy: []
      }
    });

    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });

    const otherParticipants = chatRoom.participants.filter(p => p !== userId);
    for (const participantId of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: participantId,
          Type: 'message',
          title: 'New Message',
          body: content.substring(0, 100),
          data: {
            chatRoomId: roomId,
            messageId: message.id
          },
          isRead: false
        }
      });
    }

    return successResponse(res, 'Message sent successfully', { message }, 201);
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return errorResponse(res, 'Message not found', null, 404);
    }

    if (message.senderId === userId) {
      return errorResponse(res, 'Cannot mark your own message as read', null, 400);
    }

    const alreadyRead = message.readBy.some(read => read.userId === userId);
    
    if (!alreadyRead) {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          readBy: {
            push: { userId, readAt: new Date() }
          }
        }
      });
    }

    return successResponse(res, 'Message marked as read');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return errorResponse(res, 'Message not found', null, 404);
    }

    if (message.senderId !== userId) {
      return errorResponse(res, 'You can only delete your own messages', null, 403);
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return successResponse(res, 'Message deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};