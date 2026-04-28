import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  HELPER FUNCTIONS 

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'car_listings', resource_type: 'image' },
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

//  USER CAR CONTROLLERS 

export const createCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, carType, brand, model, year, rentPrice, location, contactCoinLimit } = req.body;

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    const carData = {
      ownerId: userId,
      title,
      description,
      carType,
      brand,
      model,
      year: parseInt(year),
      rentPrice: parseFloat(rentPrice),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: contactCoinLimit || 0,
      status: 'active'
    };

    const car = await prisma.carListing.create({
      data: carData
    });

    return successResponse(res, 'Car listing created successfully', { car }, 201);
  } catch (error) {
    console.error('Create car error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyCars = async (req, res) => {
  try {
    const userId = req.user.id;

    const cars = await prisma.carListing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, `Retrieved ${cars.length} cars`, { cars });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await prisma.carListing.findUnique({
      where: { id }
    });

    if (!car) {
      return errorResponse(res, 'Car listing not found', null, 404);
    }

    return successResponse(res, 'Car retrieved successfully', { car });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, carType, brand, model, year, rentPrice, location, contactCoinLimit, status } = req.body;

    const existingCar = await prisma.carListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingCar) {
      return errorResponse(res, 'Car not found or unauthorized', null, 404);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (carType !== undefined) updateData.carType = carType;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (rentPrice !== undefined) updateData.rentPrice = parseFloat(rentPrice);
    if (location !== undefined) {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      updateData.location = parsedLocation;
    }
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = contactCoinLimit;
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingCar.images, ...newImageUrls];
    }

    const updatedCar = await prisma.carListing.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, 'Car updated successfully', { car: updatedCar });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingCar = await prisma.carListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingCar) {
      return errorResponse(res, 'Car not found or unauthorized', null, 404);
    }

    await prisma.carListing.delete({ where: { id } });

    return successResponse(res, 'Car deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const existingCar = await prisma.carListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingCar) {
      return errorResponse(res, 'Car not found or unauthorized', null, 404);
    }

    const updatedCar = await prisma.carListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'Car status updated', { car: updatedCar });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  PUBLIC CAR CONTROLLERS 

export const getAllCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, carType, brand, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const where = { status: 'active' };
    if (carType) where.carType = carType;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.rentPrice = {};
      if (minPrice) where.rentPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.rentPrice.lte = parseFloat(maxPrice);
    }

    const [cars, total] = await Promise.all([
      prisma.carListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.carListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${cars.length} cars`, {
      cars,
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

export const searchCarsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [cars, total] = await Promise.all([
      prisma.carListing.findMany({
        where: {
          status: 'active',
          location: {
            path: 'city',
            equals: city
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.carListing.count({
        where: {
          status: 'active',
          location: {
            path: 'city',
            equals: city
          }
        }
      })
    ]);

    return successResponse(res, `Found ${cars.length} cars in ${city}`, {
      cars,
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

//  ADMIN CAR CONTROLLERS 

export const adminGetAllCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [cars, total] = await Promise.all([
      prisma.carListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.carListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${cars.length} cars`, {
      cars,
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

export const adminUpdateCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingCar = await prisma.carListing.findUnique({
      where: { id }
    });

    if (!existingCar) {
      return errorResponse(res, 'Car not found', null, 404);
    }

    const updatedCar = await prisma.carListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'Car status updated by admin', { car: updatedCar });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminDeleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCar = await prisma.carListing.findUnique({
      where: { id }
    });

    if (!existingCar) {
      return errorResponse(res, 'Car not found', null, 404);
    }

    await prisma.carListing.delete({ where: { id } });

    return successResponse(res, 'Car deleted by admin successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};