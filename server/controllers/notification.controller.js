import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, read } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (read !== undefined) filter.isRead = read === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const grouped = {
      today: notifications.filter(n => new Date(n.createdAt) >= today),
      yesterday: notifications.filter(n => {
        const date = new Date(n.createdAt);
        return date >= yesterday && date < today;
      }),
      thisWeek: notifications.filter(n => {
        const date = new Date(n.createdAt);
        return date >= thisWeek && date < yesterday;
      }),
      older: notifications.filter(n => new Date(n.createdAt) < thisWeek)
    };

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      grouped,
      unreadCount,
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

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const markMultipleAsRead = async (req, res) => {
  try {
    const { ids } = req.body; 

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of notification IDs'
      });
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      { isRead: true }
    );

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user._id,
      isRead: true
    });

    res.json({
      success: true,
      message: `${result.deletedCount} read notifications deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createNotification = async (userId, type, title, body, data = {}) => {
  try {
    if (!userId || !type || !title || !body) {
      console.error('Missing required fields for notification');
      return null;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
      isRead: false
    });

  

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export const createBulkNotifications = async (userIds, type, title, body, data = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      body,
      data,
      isRead: false
    }));

    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return null;
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }}
    ]);

    const total = await Notification.countDocuments({ userId: req.user._id });
    const unread = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      message: 'Notification statistics retrieved successfully',
      data: {
        total,
        unread,
        byType: stats
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