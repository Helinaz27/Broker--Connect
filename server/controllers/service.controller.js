import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  saveServiceToDatabase,
  findServiceById,
  findAllServices,
  findAllActiveServices,
  updateServiceInDatabase
} from '../services/service.service.js';

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

const formatServiceResponse = (service, isOwner = false, isAdmin = false) => {
  const baseData = {
    id: service.id,
    title: service.title,
    description: service.description,
    serviceType: service.serviceType,
    price: service.price,
    location: {
      city: service.location?.city,
      subCity: service.location?.subCity,
      placeName: service.location?.placeName,
      fullAddress: `${service.location?.placeName || ''} ${service.location?.subCity || ''} ${service.location?.city || ''}`.trim()
    },
    images: service.images,
    contactCoinLimit: service.contactCoinLimit,
    status: service.status,
    createdAt: service.createdAt
  };

  if (isOwner || isAdmin) {
    baseData.ownerId = service.ownerId;
    baseData.paidUntil = service.paidUntil;
    baseData.updatedAt = service.updatedAt;
    baseData.isExpired = service.paidUntil ? new Date() > new Date(service.paidUntil) : false;
    baseData.daysRemaining = service.paidUntil ? Math.ceil((new Date(service.paidUntil) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  }

  return baseData;
};

//  CREATE SERVICE 
export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { title, description, serviceType, price, location, contactCoinLimit, durationDays } = req.body;
   

    if (!durationDays || durationDays < 1) {
      return errorResponse(res, 'Duration days is required and must be at least 1 day', null, 400);
    }

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    const POSTING_RATE_PER_DAY = 1;
    const totalCoinsNeeded = durationDays * POSTING_RATE_PER_DAY;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user || user.coins < totalCoinsNeeded) {
      return errorResponse(res, `Insufficient coins. Need ${totalCoinsNeeded} coins for ${durationDays} days. Please buy coins first.`, null, 400);
    }

    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + parseInt(durationDays));

    await prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: totalCoinsNeeded } }
    });

    await prisma.coinTransaction.create({
      data: {
        userId: userId,
        type: 'debit',
        amount: totalCoinsNeeded,
        Reason: 'posting_fee',
        description: `Paid ${totalCoinsNeeded} coins for ${durationDays} days of service listing`
      }
    });

    const serviceData = {
      ownerId: userId,
      title,
      description,
      serviceType,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: parseInt(contactCoinLimit) || 0,
      postingFeeId: null,
      paidUntil: paidUntil,
      status: 'active'
    };

    const service = await saveServiceToDatabase(serviceData);

    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true }
    });

    const formattedResponse = {
      id: service.id,
      title: service.title,
      description: service.description,
      serviceType: service.serviceType,
      price: service.price,
      location: {
        city: service.location.city,
        subCity: service.location.subCity,
        placeName: service.location.placeName,
        fullAddress: `${service.location.placeName || ''} ${service.location.subCity || ''} ${service.location.city || ''}`.trim()
      },
      images: service.images,
      contactCoinLimit: service.contactCoinLimit,
      status: service.status,
      createdAt: service.createdAt,
      owner: {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`,
        phone: owner.phone,
        email: owner.email
      },
      postingDetails: {
        durationDays: parseInt(durationDays),
        totalCoinsPaid: totalCoinsNeeded,
        paidUntil: paidUntil,
        expiresIn: `${durationDays} days`,
        isActive: true
      },
      currentCoinsRemaining: user.coins - totalCoinsNeeded
    };

    return successResponse(res, `Dear ${userFullName}, your service listing '${title}' has been posted successfully for ${durationDays} days.`, { service: formattedResponse }, 201);
  } catch (error) {
    console.error('Create service error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE SERVICE 
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { title, description, serviceType, price, location, contactCoinLimit, status } = req.body;

    const existingService = await findServiceById(id);

    if (!existingService) {
      return errorResponse(res, 'Service not found', null, 404);
    }

    if (!isAdmin && existingService.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this service', null, 403);
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
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = parseInt(contactCoinLimit);
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingService.images, ...newImageUrls];
    }

    const updatedService = await updateServiceInDatabase(id, updateData);

    const formattedService = formatServiceResponse(updatedService, !isAdmin, isAdmin);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your service has been updated successfully`, { service: formattedService });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE SERVICE STATUS 
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Status must be active or inactive', null, 400);
    }

    const existingService = await findServiceById(id);

    if (!existingService) {
      return errorResponse(res, 'Service not found', null, 404);
    }

    if (!isAdmin && existingService.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this service status', null, 403);
    }

    const updatedService = await updateServiceInDatabase(id, { status });

    return successResponse(res, `Service status updated to ${status} successfully`, {
      id: updatedService.id,
      status: updatedService.status,
      updatedAt: updatedService.updatedAt
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET ALL SERVICES (Public - Active only) 
export const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const allServices = await findAllActiveServices();
    
    const total = allServices.length;
    const services = allServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, false, false));

    return successResponse(res, `Retrieved ${formattedServices.length} services successfully`, {
      services: formattedServices,
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

//  GET MY SERVICES (User - own services) 
export const getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const allServices = await findAllServices();
    
    const myServices = allServices.filter(service => service.ownerId === userId);
    const total = myServices.length;
    const services = myServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, true, false));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, you have ${formattedServices.length} of ${total} services`, {
      services: formattedServices,
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

//  ADMIN GET ALL SERVICES 
export const adminGetAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let allServices = await findAllServices();
    
    if (status && status !== 'all') {
      allServices = allServices.filter(service => service.status === status);
    }
    
    const total = allServices.length;
    const services = allServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, false, true));

    return successResponse(res, `Retrieved ${formattedServices.length} services successfully`, {
      services: formattedServices,
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

//  GET SERVICE BY ID 
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await findServiceById(id);

    if (!service) {
      return errorResponse(res, 'Service not found', null, 404);
    }

    if (service.status !== 'active') {
      return errorResponse(res, 'Service not available', null, 404);
    }

    const formattedService = formatServiceResponse(service, false, false);

    return successResponse(res, 'Service retrieved successfully', { service: formattedService });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  SEARCH SERVICES (Public - Active only) 
export const searchServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, serviceType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allServices = await findAllActiveServices();

    if (serviceType) allServices = allServices.filter(s => s.serviceType === serviceType);
    if (city) allServices = allServices.filter(s => s.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) allServices = allServices.filter(s => s.price >= parseFloat(minPrice));
    if (maxPrice) allServices = allServices.filter(s => s.price <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      allServices = allServices.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allServices.length;
    const services = allServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, false, false));

    return successResponse(res, `Found ${formattedServices.length} services`, {
      services: formattedServices,
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

//  SEARCH USER SERVICES (Dashboard) 
export const searchUserServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, serviceType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allServices = await findAllServices();

    let filteredServices = allServices.filter(service => {
      return service.status === 'active' || service.ownerId === userId;
    });

    if (serviceType) filteredServices = filteredServices.filter(s => s.serviceType === serviceType);
    if (city) filteredServices = filteredServices.filter(s => s.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) filteredServices = filteredServices.filter(s => s.price >= parseFloat(minPrice));
    if (maxPrice) filteredServices = filteredServices.filter(s => s.price <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredServices.length;
    const services = filteredServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, service.ownerId === userId, false));

    return successResponse(res, `Found ${formattedServices.length} services`, {
      services: formattedServices,
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

//  SEARCH ADMIN SERVICES (Admin Dashboard) 
export const searchAdminServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allServices = await findAllServices();

    if (status && status !== 'all') allServices = allServices.filter(s => s.status === status);
    if (serviceType) allServices = allServices.filter(s => s.serviceType === serviceType);
    if (city) allServices = allServices.filter(s => s.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) allServices = allServices.filter(s => s.price >= parseFloat(minPrice));
    if (maxPrice) allServices = allServices.filter(s => s.price <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      allServices = allServices.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allServices.length;
    const services = allServices.slice(skip, skip + parseInt(limit));
    const formattedServices = services.map(service => formatServiceResponse(service, false, true));

    return successResponse(res, `Found ${formattedServices.length} services`, {
      services: formattedServices,
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