import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  createPlatformFee,
  getAllPlatformFees,
  searchPlatformFees,
  getPlatformFeeById,
  updatePlatformFee,
  deletePlatformFee,
} from '../services/platformFee.service.js';

export const createPlatformFeeCtrl = async (req, res) => {
  try {
    const adminId = req.user.id;
    const platformFee = await createPlatformFee({ ...req.body, adminId });
    return successResponse(res, 'Platform fee created successfully', { platformFee }, 201);
  } catch (error) {
    console.error('createPlatformFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const getAllPlatformFeesCtrl = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllPlatformFees({ page, limit });
    return successResponse(res, `Retrieved ${result.platformFees.length} platform fees`, result);
  } catch (error) {
    console.error('getAllPlatformFees error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const searchPlatformFeesCtrl = async (req, res) => {
  try {
    const result = await searchPlatformFees(req.query);
    return successResponse(res, `Retrieved ${result.platformFees.length} platform fees`, result);
  } catch (error) {
    console.error('searchPlatformFees error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const getPlatformFeeByIdCtrl = async (req, res) => {
  try {
    const platformFee = await getPlatformFeeById(req.params.id);
    return successResponse(res, 'Platform fee retrieved successfully', { platformFee });
  } catch (error) {
    console.error('getPlatformFeeById error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const updatePlatformFeeCtrl = async (req, res) => {
  try {
    const platformFee = await updatePlatformFee(req.params.id, req.body);
    return successResponse(res, 'Platform fee updated successfully', { platformFee });
  } catch (error) {
    console.error('updatePlatformFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const deletePlatformFeeCtrl = async (req, res) => {
  try {
    const platformFee = await deletePlatformFee(req.params.id);
    return successResponse(res, 'Platform fee deleted successfully', { platformFee });
  } catch (error) {
    console.error('deletePlatformFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};