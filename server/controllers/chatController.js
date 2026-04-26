import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import ContactAccess from '../models/ContactAccess.js'; // ADDED

export const getChatRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id
    })
    .populate('participants', 'username firstname lastname profileImage')
    .sort({ updatedAt: -1 });

    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room._id })
          .sort({ createdAt: -1 });
        
        const otherParticipant = room.participants.find(
          p => p._id.toString() !== req.user._id.toString()
        );

        const hasAccess = await ContactAccess.findOne({
          viewerId: req.user._id,
          ownerId: otherParticipant?._id,
          isActive: true
        });

        return {
          _id: room._id,
          otherParticipant,
          lastMessage,
          hasAccess: !!hasAccess, 
          unreadCount: await Message.countDocuments({
            roomId: room._id,
            senderId: { $ne: req.user._id },
            'readBy.userId': { $ne: req.user._id }
          }),
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        };
      })
    );

    res.json({
      success: true,
      message: 'Chat rooms retrieved successfully',
      data: roomsWithLastMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createChatRoom = async (req, res) => {
  try {
    const { participantId } = req.body;

    const hasAccess = await ContactAccess.findOne({
      viewerId: req.user._id,
      ownerId: participantId,
      isActive: true
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You must pay the contact fee before starting a chat'
      });
    }

    let room = await ChatRoom.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (!room) {
      room = await ChatRoom.create({
        participants: [req.user._id, participantId]
      });
    }

    await room.populate('participants', 'username firstname lastname profileImage');

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const room = await ChatRoom.findOne({
      _id: roomId,
      participants: req.user._id
    });

    if (!room) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const otherParticipant = room.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    const hasAccess = await ContactAccess.findOne({
      viewerId: req.user._id,
      ownerId: otherParticipant,
      isActive: true
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You must pay the contact fee to view messages'
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .populate('senderId', 'username firstname lastname profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ roomId });

    await Message.updateMany(
      {
        roomId,
        senderId: { $ne: req.user._id },
        'readBy.userId': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, messageType = 'text' } = req.body;

    const room = await ChatRoom.findOne({
      _id: roomId,
      participants: req.user._id
    });

    if (!room) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const otherParticipant = room.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    const hasAccess = await ContactAccess.findOne({
      viewerId: req.user._id,
      ownerId: otherParticipant,
      isActive: true
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You must pay the contact fee to send messages'
      });
    }

    const message = await Message.create({
      roomId,
      senderId: req.user._id,
      messageType,
      content,
      readBy: [{
        userId: req.user._id,
        readAt: new Date()
      }]
    });

    await ChatRoom.findByIdAndUpdate(roomId, {
      updatedAt: new Date()
    });

    await message.populate('senderId', 'username firstname lastname profileImage');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const alreadyRead = message.readBy.some(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};