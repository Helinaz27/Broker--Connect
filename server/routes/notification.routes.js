// routes/notificationRoutes.js
import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';  // Change this line

// All notification routes are protected
router.get('/', protect, notificationController.getNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);
router.get('/unread/count', protect, notificationController.getUnreadCount);

export default router;