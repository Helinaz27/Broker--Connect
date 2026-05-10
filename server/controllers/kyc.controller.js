import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  submitKYCService,
  getMyKYCStatusService,
  getAllKYCService,
  getKYCByIdService,
  approveKYCService,
  rejectKYCService
} from '../services/kyc.service.js';

export const submitKYC = async (req, res) => {
  const userId = req.user.id;
  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  const { documentType, documentNumber } = req.body;
  const result = await submitKYCService(userId, userFullName, req.files, documentType, documentNumber);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

export const getMyKYCStatus = async (req, res) => {
  const userId = req.user.id;
  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  const isKYCVerified = req.user.isKYCVerified;
  const result = await getMyKYCStatusService(userId, userFullName, isKYCVerified);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

export const getAllKYC = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await getAllKYCService(status, page, limit);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

export const getKYCById = async (req, res) => {
  const { requestId } = req.params;
  const result = await getKYCByIdService(requestId);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

export const approveKYC = async (req, res) => {
  const { requestId } = req.params;
  const adminId = req.user.id;
  const adminFullName = `${req.user.firstName} ${req.user.lastName}`;
  const result = await approveKYCService(requestId, adminId, adminFullName);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

export const rejectKYC = async (req, res) => {
  const { requestId } = req.params;
  const { reviewNote } = req.body;
  const adminId = req.user.id;
  const adminFullName = `${req.user.firstName} ${req.user.lastName}`;
  const result = await rejectKYCService(requestId, adminId, adminFullName, reviewNote);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};