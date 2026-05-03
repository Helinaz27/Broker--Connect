import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  savePostingFeeToDatabase,
  findPostingFeeById,
  findAllPostingFees,
  countAllPostingFees,
  findPostingFeesByFilter,
  countPostingFeesByFilter,
  updatePostingFeeInDatabase
} from '../services/postingFee.service.js';

//  CREATE POSTING FEE 
export const createPostingFee = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { category, durationDays, price, description } = req.body;

    const postingFeeData = {
      category,
      durationDays: parseInt(durationDays),
      price: parseFloat(price),
      description: description || null,
      isActive: true,
      createdBy: adminId
    };

    // ✅ USING SERVICE
    const postingFee = await savePostingFeeToDatabase(postingFeeData);

    return successResponse(res, 'Posting fee created successfully', { postingFee }, 201);
  } catch (error) {
    console.error('Create posting fee error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET ALL POSTING FEES 
export const getAllPostingFees = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    const [postingFees, total] = await Promise.all([
      findAllPostingFees(skip, parseInt(limit)),
      countAllPostingFees()
    ]);

    return successResponse(res, `Retrieved ${postingFees.length} posting fees`, {
      postingFees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET POSTING FEES WITH FILTERS 
export const getPostingFees = async (req, res) => {
  try {
    const { id, category, isActive, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // If ID is provided, get single posting fee
    if (id) {
      // ✅ USING SERVICE
      const postingFee = await findPostingFeeById(id);

      if (!postingFee) {
        return errorResponse(res, 'Posting fee not found', null, 404);
      }

      return successResponse(res, 'Posting fee retrieved successfully', { postingFee });
    }

    // Build filter object
    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // ✅ USING SERVICE
    const [postingFees, total] = await Promise.all([
      findPostingFeesByFilter(where, parseInt(skip), parseInt(limit)),
      countPostingFeesByFilter(where)
    ]);

    return successResponse(res, `Retrieved ${postingFees.length} posting fees`, {
      postingFees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET POSTING FEE BY ID 
export const getPostingFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ USING SERVICE
    const postingFee = await findPostingFeeById(id);

    if (!postingFee) {
      return errorResponse(res, 'Posting fee not found', null, 404);
    }

    return successResponse(res, 'Posting fee retrieved successfully', { postingFee });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE POSTING FEE 
export const updatePostingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, durationDays, price, description, isActive } = req.body;

    // ✅ USING SERVICE
    const existingPostingFee = await findPostingFeeById(id);

    if (!existingPostingFee) {
      return errorResponse(res, 'Posting fee not found', null, 404);
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (durationDays !== undefined) updateData.durationDays = parseInt(durationDays);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // ✅ USING SERVICE
    const updatedPostingFee = await updatePostingFeeInDatabase(id, updateData);

    return successResponse(res, 'Posting fee updated successfully', { postingFee: updatedPostingFee });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};