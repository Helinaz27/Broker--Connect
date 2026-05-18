import express from 'express';
import { can } from '../middleware/can.js';
import * as chatController from '../controllers/chat.controller.js';
import { createRoomValidator } from '../validators/chat.validator.js';

const router = express.Router();

router.post('/', can('chatRoom', 'createOwn'), createRoomValidator, chatController.createRoom);
router.get('/', can('chatRoom', 'readOwn'), chatController.getMyRooms);
router.get('/:roomId', can('chatRoom', 'readOwn'), chatController.getRoomById);

router.get('/admin/all', can('chatRoom', 'manage'), chatController.adminGetAllRooms);
router.get('/admin/:roomId', can('chatRoom', 'manage'), chatController.adminGetRoomById);

export default router;