import {
  createRoomService,
  getMyRoomsService,
  getRoomByIdService,
  adminGetAllRoomsService,
  adminGetRoomByIdService,
} from '../services/chat.service.js';

const handleError = (res, error) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const createRoom = async (req, res) => {
  try {
    const room = await createRoomService(req.user.id, req.body.listingId, req.body.participantId);
    return res.status(201).json({ success: true, data: room });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rooms, total } = await getMyRoomsService(req.user.id, page, limit);
    return res.status(200).json({ success: true, data: rooms, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await getRoomByIdService(req.user.id, req.params.roomId);
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    return handleError(res, error);
  }
};

export const adminGetAllRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rooms, total } = await adminGetAllRoomsService(page, limit);
    return res.status(200).json({ success: true, data: rooms, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleError(res, error);
  }
};

export const adminGetRoomById = async (req, res) => {
  try {
    const room = await adminGetRoomByIdService(req.params.roomId);
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    return handleError(res, error);
  }
};