import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

//  HELPER FUNCTIONS 

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'service_listings', resource_type: 'image' },
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

//  USER SERVICE CONTROLLERS 

export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, serviceType, price, location, contactCoinLimit } = req.body;

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    const serviceData = {
      ownerId: userId,
      title,
      description,
      serviceType,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: contactCoinLimit || 0,
      status: 'active'
    };

    const service = await prisma.serviceListing.create({
      data: serviceData
    });

    return successResponse(res, 'Service listing created successfully', { service }, 201);
  } catch (error) {
    console.error('Create service error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const services = await prisma.serviceListing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, `Retrieved ${services.length} services`, { services });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.serviceListing.findUnique({
      where: { id }
    });

    if (!service) {
      return errorResponse(res, 'Service listing not found', null, 404);
    }

    return successResponse(res, 'Service retrieved successfully', { service });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, serviceType, price, location, contactCoinLimit, status } = req.body;

    const existingService = await prisma.serviceListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found or unauthorized', null, 404);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (location !== undefined) {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      updateData.location = parsedLocation;
    }
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = contactCoinLimit;
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingService.images, ...newImageUrls];
    }

    const updatedService = await prisma.serviceListing.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, 'Service updated successfully', { service: updatedService });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingService = await prisma.serviceListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found or unauthorized', null, 404);
    }

    await prisma.serviceListing.delete({ where: { id } });

    return successResponse(res, 'Service deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const existingService = await prisma.serviceListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found or unauthorized', null, 404);
    }

    const updatedService = await prisma.serviceListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'Service status updated', { service: updatedService });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  PUBLIC SERVICE CONTROLLERS 

export const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, serviceType, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const where = { status: 'active' };
    if (serviceType) where.serviceType = serviceType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [services, total] = await Promise.all([
      prisma.serviceListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.serviceListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${services.length} services`, {
      services,
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

export const searchServicesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.serviceListing.findMany({
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
      prisma.serviceListing.count({
        where: {
          status: 'active',
          location: {
            path: 'city',
            equals: city
          }
        }
      })
    ]);

    return successResponse(res, `Found ${services.length} services in ${city}`, {
      services,
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

export const getServicesByType = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.serviceListing.findMany({
        where: {
          status: 'active',
          serviceType: serviceType
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.serviceListing.count({
        where: {
          status: 'active',
          serviceType: serviceType
        }
      })
    ]);

    return successResponse(res, `Found ${services.length} ${serviceType} services`, {
      services,
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

//  ADMIN SERVICE CONTROLLERS 

export const adminGetAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [services, total] = await Promise.all([
      prisma.serviceListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.serviceListing.count({ where })
    ]);

    return successResponse(res, `Retrieved ${services.length} services`, {
      services,
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

export const adminUpdateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingService = await prisma.serviceListing.findUnique({
      where: { id }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found', null, 404);
    }

    const updatedService = await prisma.serviceListing.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, 'Service status updated by admin', { service: updatedService });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminDeleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const existingService = await prisma.serviceListing.findUnique({
      where: { id }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found', null, 404);
    }

    await prisma.serviceListing.delete({ where: { id } });

    return successResponse(res, 'Service deleted by admin successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};