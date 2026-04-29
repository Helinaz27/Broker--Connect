import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { createNotification } from '../services/notification.service.js';

//  USER CHAT CONTROLLERS 

export const createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId, listingId, listingType } = req.body;

    // Check if chat already exists
    const existingChat = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { participants: { has: userId } },
          { participants: { has: participantId } }
        ]
      }
    });

    if (existingChat) {
      return successResponse(res, 'Chat already exists', { chatRoom: existingChat });
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        participants: [userId, participantId]
      }
    });

    return successResponse(res, 'Chat created successfully', { chatRoom }, 201);
  } catch (error) {
    console.error('Create chat error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [chatRooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where: {
          participants: { has: userId }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.chatRoom.count({
        where: { participants: { has: userId } }
      })
    ]);

    // Get last message for each chat room
    const chatsWithLastMessage = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await prisma.message.findFirst({
          where: { roomId: room.id },
          orderBy: { createdAt: 'desc' }
        });
        
        // Get other participant info
        const otherParticipantId = room.participants.find(p => p !== userId);
        const otherParticipant = await prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: { id: true, firstName: true, lastName: true, profileImage: true }
        });

        return {
          ...room,
          otherParticipant,
          lastMessage
        };
      })
    );

    return successResponse(res, `Retrieved ${chatRooms.length} chats`, {
      chats: chatsWithLastMessage,
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

export const getChatMessages = async (req, res) => {
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

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        content,
        messageType,
        readBy: []
      }
    });

    // Update chat room updatedAt
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });

    // Create notification for other participants
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

export const markMessageAsRead = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        roomId: roomId
      }
    });

    if (!message) {
      return errorResponse(res, 'Message not found', null, 404);
    }

    // Check if already read by this user
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

//  ADMIN CHAT CONTROLLERS 

export const adminGetAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [chatRooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.chatRoom.count()
    ]);

    return successResponse(res, `Retrieved ${chatRooms.length} chats`, {
      chats: chatRooms,
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

export const adminDeleteChat = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Delete all messages in the chat room first
    await prisma.message.deleteMany({
      where: { roomId }
    });

    // Delete the chat room
    await prisma.chatRoom.delete({
      where: { id: roomId }
    });

    return successResponse(res, 'Chat deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};