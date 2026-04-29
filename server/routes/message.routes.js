import express from 'express';
import { protect } from '../middleware/auth.js';
import * as messageController from '../controllers/message.controller.js';
import { sendMessageValidator } from '../validators/message.validator.js';

const router = express.Router();

//  USER MESSAGE ROUTES 
router.get('/:roomId', protect, messageController.getMessagesByRoom);
router.post('/:roomId', protect, sendMessageValidator, messageController.sendMessage);
router.put('/:messageId/read', protect, messageController.markAsRead);
router.delete('/:messageId', protect, messageController.deleteMessage);

export default router;