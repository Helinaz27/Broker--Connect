import {
  sendMessageService,
  getMessagesService,
  adminGetAllMessagesService,
  adminGetRoomMessagesService,
} from '../services/message.service.js';

const handleError = (res, error) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const sendMessage = async (req, res) => {
  try {
    const { content, messageType, listingId } = req.body;
    const message = await sendMessageService(req.params.roomId, req.user.id, content, messageType, listingId);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const { messages, total } = await getMessagesService(req.user.id, req.params.roomId, page, limit);
    return res.status(200).json({ success: true, data: messages, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleError(res, error);
  }
};

export const adminGetAllMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const { messages, total } = await adminGetAllMessagesService(page, limit);
    return res.status(200).json({ success: true, data: messages, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleError(res, error);
  }
};

export const adminGetRoomMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const { messages, total } = await adminGetRoomMessagesService(req.params.roomId, page, limit);
    return res.status(200).json({ success: true, data: messages, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleError(res, error);
  }
};