import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  ADMIN POSTING FEE CONTROLLERS 

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

    const postingFee = await prisma.postingFee.create({
      data: postingFeeData
    });

    return successResponse(res, 'Posting fee created successfully', { postingFee }, 201);
  } catch (error) {
    console.error('Create posting fee error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getAllPostingFees = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [postingFees, total] = await Promise.all([
      prisma.postingFee.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.postingFee.count({ where })
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

export const getPostingFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const postingFee = await prisma.postingFee.findUnique({
      where: { id }
    });

    if (!postingFee) {
      return errorResponse(res, 'Posting fee not found', null, 404);
    }

    return successResponse(res, 'Posting fee retrieved successfully', { postingFee });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updatePostingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, durationDays, price, description, isActive } = req.body;

    const existingPostingFee = await prisma.postingFee.findUnique({
      where: { id }
    });

    if (!existingPostingFee) {
      return errorResponse(res, 'Posting fee not found', null, 404);
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (durationDays !== undefined) updateData.durationDays = parseInt(durationDays);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPostingFee = await prisma.postingFee.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, 'Posting fee updated successfully', { postingFee: updatedPostingFee });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deletePostingFee = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPostingFee = await prisma.postingFee.findUnique({
      where: { id }
    });

    if (!existingPostingFee) {
      return errorResponse(res, 'Posting fee not found', null, 404);
    }

    await prisma.postingFee.delete({
      where: { id }
    });

    return successResponse(res, 'Posting fee deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  PUBLIC POSTING FEE CONTROLLERS 

export const getActivePostingFees = async (req, res) => {
  try {
    const postingFees = await prisma.postingFee.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    return successResponse(res, `Retrieved ${postingFees.length} active posting fees`, { postingFees });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getPostingFeesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const postingFees = await prisma.postingFee.findMany({
      where: {
        category: category,
        isActive: true
      },
      orderBy: { durationDays: 'asc' }
    });

    return successResponse(res, `Retrieved ${postingFees.length} posting fees for ${category}`, { postingFees });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};