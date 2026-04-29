import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  USER NOTIFICATION CONTROLLERS 

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    return successResponse(res, `Retrieved ${notifications.length} notifications`, {
      notifications,
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

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return successResponse(res, 'Unread count retrieved', { unreadCount: count });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', null, 404);
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: { isRead: true }
    });

    return successResponse(res, 'Notification marked as read', { notification: updatedNotification });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return successResponse(res, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', null, 404);
    }

    await prisma.notification.delete({
      where: { id: id }
    });

    return successResponse(res, 'Notification deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: { userId: userId }
    });

    return successResponse(res, 'All notifications deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN NOTIFICATION CONTROLLERS 

export const sendSystemNotification = async (req, res) => {
  try {
    const { title, body, Type, userId, data } = req.body;

    let notificationData = {
      title,
      body,
      Type,
      isRead: false
    };

    if (data) {
      notificationData.data = data;
    }

    if (userId) {
      // Send to specific user
      notificationData.userId = userId;
      const notification = await prisma.notification.create({
        data: notificationData
      });
      return successResponse(res, 'Notification sent to user', { notification }, 201);
    } else {
      // Send to all users
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });

      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              ...notificationData,
              userId: user.id
            }
          })
        )
      );

      return successResponse(res, `Notification sent to ${notifications.length} users`, { count: notifications.length }, 201);
    }
  } catch (error) {
    console.error('Send notification error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminGetAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, Type } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (Type) where.Type = Type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    return successResponse(res, `Retrieved ${notifications.length} notifications`, {
      notifications,
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