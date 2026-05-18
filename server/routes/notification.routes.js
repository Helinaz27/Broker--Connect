import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

//  USER NOTIFICATION ROUTES 
router.get('/', protect, notificationController.getMyNotifications);
router.get('/unread/count', protect, notificationController.getUnreadCount);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);
router.delete('/', protect, notificationController.deleteAllNotifications);

//  ADMIN NOTIFICATION ROUTES 
router.post('/admin/send', protect, admin, notificationController.sendSystemNotification);
router.get('/admin/all', protect, admin, notificationController.adminGetAllNotifications);

export default router;