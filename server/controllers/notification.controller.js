import { successResponse, errorResponse } from "../utils/helpers.js";
import {
  getMyNotificationsService,
  getUnreadCountService,
  markAllAsReadService,
  markOneAsReadService,
  notifySystem,
  broadcastSystemNotification,
  adminGetAllNotificationsService,
  deleteNotificationService,
} from "../services/notification.service.js";

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  return { page, limit };
};

export const getMyNotifications = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await getMyNotificationsService({
      userId: req.user.id,
      page,
      limit,
      isRead: req.query.isRead,
    });
    return successResponse(
      res,
      `Retrieved ${result.notifications.length} notifications`,
      result,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCountService(req.user.id);
    return successResponse(res, "Unread count retrieved", {
      unreadCount: count,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const markOneAsRead = async (req, res) => {
  try {
    await markOneAsReadService(req.user.id, req.params.id);
    return successResponse(res, "Notification marked as read");
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await markAllAsReadService(req.user.id);
    return successResponse(res, "All notifications marked as read");
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const sendSystemNotification = async (req, res) => {
  try {
    const { title, body, userId, path } = req.body;
    if (userId) {
      await notifySystem({ userId, title, body, path });
      return successResponse(res, "Notification sent to user", null, 201);
    } else {
      await broadcastSystemNotification({ title, body, path });
      return successResponse(
        res,
        "Notification broadcast to all users",
        null,
        201,
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const adminGetAllNotifications = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { userId, type } = req.query;
    const result = await adminGetAllNotificationsService({
      page,
      limit,
      userId,
      type,
    });
    return successResponse(
      res,
      `Retrieved ${result.notifications.length} notifications`,
      result,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await deleteNotificationService(req.user.id, req.params.id);
    return successResponse(res, "Notification deleted");
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Server error",
      null,
      error.statusCode || 500,
    );
  }
};
