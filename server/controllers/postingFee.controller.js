import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  savePostingFee,
  fetchAllPostingFees,
  modifyPostingFee,
  fetchPostingFeesByFilter,
  fetchPostingFeeById,
  removePostingFee,
} from '../services/postingFee.service.js';

export const createPostingFee = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { category, listingMode, durationDays, price, description } = req.body;

    const postingFee = await savePostingFee({ category, listingMode, durationDays, price, description, adminId });

    return successResponse(res, 'Posting fee created successfully', { postingFee }, 201);
  } catch (error) {
    console.error('createPostingFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const getAllPostingFees = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await fetchAllPostingFees({ page, limit });

    return successResponse(res, `Retrieved ${result.postingFees.length} posting fees`, result);
  } catch (error) {
    console.error('getAllPostingFees error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const updatePostingFee = async (req, res) => {
  try {
    const { id } = req.params;

    const postingFee = await modifyPostingFee(id, req.body);

    return successResponse(res, 'Posting fee updated successfully', { postingFee });
  } catch (error) {
    console.error('updatePostingFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const getPostingFees = async (req, res) => {
  try {
    const { id, category, listingMode, isActive, page, limit } = req.query;

    const result = await fetchPostingFeesByFilter({ id, category, listingMode, isActive, page, limit });

    if (result.single) {
      return successResponse(res, 'Posting fee retrieved successfully', { postingFee: result.postingFee });
    }

    return successResponse(res, `Retrieved ${result.postingFees.length} posting fees`, result);
  } catch (error) {
    console.error('getPostingFees error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

export const getPostingFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const postingFee = await fetchPostingFeeById(id);

    return successResponse(res, 'Posting fee retrieved successfully', { postingFee });
  } catch (error) {
    console.error('getPostingFeeById error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};

// DELETE /:id
export const deletePostingFee = async (req, res) => {
  try {
    const { id } = req.params;

    const postingFee = await removePostingFee(id);

    return successResponse(res, 'Posting fee deleted successfully', { postingFee });
  } catch (error) {
    console.error('deletePostingFee error:', error);
    return errorResponse(res, error.message || 'Server error', null, error.statusCode || 500);
  }
};