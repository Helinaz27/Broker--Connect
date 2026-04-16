// routes/chatRoutes.js
import express from 'express';
const router = express.Router();
import * as chatController from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';  // Change this line

// All chat routes are protected
router.get('/rooms', protect, chatController.getChatRooms);
router.post('/rooms', protect, chatController.createChatRoom);
router.get('/rooms/:roomId/messages', protect, chatController.getMessages);
router.post('/rooms/:roomId/messages', protect, chatController.sendMessage);
router.put('/messages/:messageId/read', protect, chatController.markMessageRead);

export default router;