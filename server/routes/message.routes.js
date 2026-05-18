import express from 'express';
import { can } from '../middleware/can.js';
import * as messageController from '../controllers/message.controller.js';
import { sendMessageValidator } from '../validators/message.validator.js';

const router = express.Router();

router.post('/:roomId', can('message', 'createOwn'), sendMessageValidator, messageController.sendMessage);
router.get('/:roomId', can('message', 'readOwn'), messageController.getMessages);

router.get('/admin/all', can('message', 'manage'), messageController.adminGetAllMessages);
router.get('/admin/room/:roomId', can('message', 'manage'), messageController.adminGetRoomMessages);

export default router;