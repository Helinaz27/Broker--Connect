import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as chatController from '../controllers/chat.controller.js';
import { createChatValidator, sendMessageValidator } from '../validators/chat.validator.js';

const router = express.Router();

//  USER CHAT ROUTES 
router.post('/', protect, createChatValidator, chatController.createChat);
router.get('/my-chats', protect, chatController.getMyChats);
router.get('/:roomId/messages', protect, chatController.getChatMessages);
router.post('/:roomId/messages', protect, sendMessageValidator, chatController.sendMessage);
router.put('/:roomId/messages/:messageId/read', protect, chatController.markMessageAsRead);

//  ADMIN CHAT ROUTES 
router.get('/admin/all', protect, admin, chatController.adminGetAllChats);
router.delete('/admin/:roomId', protect, admin, chatController.adminDeleteChat);

export default router;