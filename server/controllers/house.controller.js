import * as houseService from '../services/house.service.js';
import { uploadManyToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';import { successResponse, errorResponse, formatPagination } from '../utils/helpers.js';

export const createHouse = async (req, res) => {
  try {
    const userId = req.user.id;
    const houseData = req.body;

    // Validate images present
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'At least one image is required', null, 400);
    }

    // Upload to Cloudinary, attach URLs
    houseData.images = await uploadManyToCloudinary(req.files, 'listings');

    const house = await houseService.saveHouseToDatabase(houseData, userId);

    return successResponse(res, 'House created successfully', { house }, 201);
  } catch (error) {
    if (error.message === 'Insufficient coins to set this contact coin limit') {
      return errorResponse(res, error.message, null, 400);
    }
    return errorResponse(res, error.message, null, 500);
  }
};

export const getAllHouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { houses, total, page: currentPage, limit: currentLimit } =
      await houseService.findAllActiveHouses(page, limit);

    const pagination = formatPagination(currentPage, currentLimit, total);

    return successResponse(res, 'Houses retrieved successfully', { houses, pagination }, 200);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

export const searchHouses = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      listingMode: req.query.listingMode,
      houseType: req.query.houseType,
      city: req.query.city,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      bedrooms: req.query.bedrooms,
      search: req.query.search,
      includeAllStatuses: false,
    };

    const { houses, total, page, limit } = await houseService.searchActiveHouses(filters);

    const pagination = formatPagination(page, limit, total);

    return successResponse(res, 'Houses searched successfully', { houses, pagination }, 200);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

export const getHouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const house = await houseService.findHouseById(id);

    return successResponse(res, 'House retrieved successfully', { house }, 200);
  } catch (error) {
    if (error.message === 'House not found') {
      return errorResponse(res, error.message, null, 404);
    }
    return errorResponse(res, error.message, null, 500);
  }
};

export const getMyHouses = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { houses, total, page: currentPage, limit: currentLimit } =
      await houseService.findHousesByOwnerId(userId, page, limit);

    const pagination = formatPagination(currentPage, currentLimit, total);

    return successResponse(res, 'Your houses retrieved successfully', { houses, pagination }, 200);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

export const updateHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Upload new images only if provided — existing DB images stay untouched otherwise
    if (req.files && req.files.length > 0) {
      updateData.images = await uploadManyToCloudinary(req.files, 'listings');
    }

    const house = await houseService.updateHouseInDatabase(id, updateData, userId, false);

    return successResponse(res, 'House updated successfully', { house }, 200);
  } catch (error) {
    if (error.message === 'House not found') {
      return errorResponse(res, error.message, null, 404);
    }
    if (error.message === 'You do not have permission to update this house') {
      return errorResponse(res, error.message, null, 403);
    }
    return errorResponse(res, error.message, null, 500);
  }
};

export const updateHouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', null, 400);
    }

    const isAdmin = req.user.roles?.includes('admin') || req.user.role === 'admin';

    const house = await houseService.updateHouseInDatabase(id, { status }, userId, isAdmin);

    return successResponse(res, 'House status updated successfully', { house }, 200);
  } catch (error) {
    if (error.message === 'House not found') {
      return errorResponse(res, error.message, null, 404);
    }
    if (error.message === 'You do not have permission to update this house') {
      return errorResponse(res, error.message, null, 403);
    }
    return errorResponse(res, error.message, null, 500);
  }
};

export const deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.roles?.includes('admin') || req.user.role === 'admin';

    const house = await houseService.deleteHouseFromDatabase(id, userId, isAdmin);

    // Clean up Cloudinary images after successful DB delete
    // allSettled so a Cloudinary failure doesn't affect the response
    if (house.images && house.images.length > 0) {
      await Promise.allSettled(house.images.map((url) => deleteFromCloudinary(url)));
    }

    return successResponse(res, 'House deleted successfully', { house }, 200);
  } catch (error) {
    if (error.message === 'House not found') {
      return errorResponse(res, error.message, null, 404);
    }
    if (error.message === 'You do not have permission to delete this house') {
      return errorResponse(res, error.message, null, 403);
    }
    return errorResponse(res, error.message, null, 500);
  }
};

export const adminGetAllHouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const { houses, total, page: currentPage, limit: currentLimit } =
      await houseService.findAllHouses(page, limit, status);

    const pagination = formatPagination(currentPage, currentLimit, total);

    return successResponse(res, 'All houses retrieved successfully', { houses, pagination }, 200);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

export const searchAdminHouses = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      listingMode: req.query.listingMode,
      houseType: req.query.houseType,
      city: req.query.city,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      bedrooms: req.query.bedrooms,
      search: req.query.search,
      status: req.query.status,
      includeAllStatuses: true,
    };

    const { houses, total, page, limit } = await houseService.searchAllHouses(filters);

    const pagination = formatPagination(page, limit, total);

    return successResponse(res, 'Houses searched successfully', { houses, pagination }, 200);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};