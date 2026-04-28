import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  HELPER FUNCTIONS 

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'house_listings', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(file.buffer);
    });
  });
  return await Promise.all(uploadPromises);
};

//  USER HOUSE CONTROLLERS 

export const createHouse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, houseType, price, location, contactCoinLimit } = req.body;

    // Parse location if it's a string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    // Prepare house data
    const houseData = {
      ownerId: userId,
      title,
      description,
      houseType,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: contactCoinLimit || 0,
      status: 'active'
    };

    const house = await prisma.houseListing.create({
      data: houseData
    });

    return successResponse(res, 'House listing created successfully', { house }, 201);
  } catch (error) {
    console.error('Create house error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyHouses = async (req, res) => {
  try {
    const userId = req.user.id;

    const houses = await prisma.houseListing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, `Retrieved ${houses.length} houses`, { houses });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getHouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const house = await prisma.houseListing.findUnique({
      where: { id }
    });

    if (!house) {
      return errorResponse(res, 'House listing not found', null, 404);
    }

    return successResponse(res, 'House retrieved successfully', { house });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, houseType, price, location, contactCoinLimit, status } = req.body;

    // Check if house exists and belongs to user
    const existingHouse = await prisma.houseListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found or unauthorized', null, 404);
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (houseType !== undefined) updateData.houseType = houseType;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (location !== undefined) {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      updateData.location = parsedLocation;
    }
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = contactCoinLimit;
    if (status !== undefined) updateData.status = status;

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingHouse.images, ...newImageUrls];
    }

    const updatedHouse = await prisma.houseListing.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, 'House updated successfully', { house: updatedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingHouse = await prisma.houseListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found or unauthorized', null, 404);
    }

    await prisma.houseListing.delete({ where: { id } });

    return successResponse(res, 'House deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateHouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const existingHouse = await prisma.houseListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found or unauthorized', null, 404);
    }

    const updatedHouse = await prisma.houseListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'House status updated', { house: updatedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  PUBLIC HOUSE CONTROLLERS 

export const getAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, houseType, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const where = { status: 'active' };
    if (houseType) where.houseType = houseType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${houses.length} houses`, {
      houses,
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

export const searchHousesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'active',
      location: {
        path: 'city',
        equals: city
      }
    };

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    return successResponse(res, `Found ${houses.length} houses in ${city}`, {
      houses,
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

//  ADMIN HOUSE CONTROLLERS 

export const adminGetAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${houses.length} houses`, {
      houses,
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

export const adminUpdateHouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingHouse = await prisma.houseListing.findUnique({
      where: { id }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found', null, 404);
    }

    const updatedHouse = await prisma.houseListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'House status updated by admin', { house: updatedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminDeleteHouse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingHouse = await prisma.houseListing.findUnique({
      where: { id }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found', null, 404);
    }

    await prisma.houseListing.delete({ where: { id } });

    return successResponse(res, 'House deleted by admin successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};