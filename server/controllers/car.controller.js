// controllers/car.controller.js
import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  saveCarToDatabase,
  findCarById,
  findAllCars,
  findAllActiveCars,
  updateCarInDatabase
} from '../services/car.service.js';

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

const formatCarResponse = (car, isOwner = false, isAdmin = false) => {
  const baseData = {
    id: car.id,
    title: car.title,
    description: car.description,
    carType: car.carType,
    brand: car.brand,
    model: car.model,
    year: car.year,
    rentPrice: car.rentPrice,
    location: {
      city: car.location?.city,
      subCity: car.location?.subCity,
      placeName: car.location?.placeName,
      fullAddress: `${car.location?.placeName || ''} ${car.location?.subCity || ''} ${car.location?.city || ''}`.trim()
    },
    images: car.images,
    contactCoinLimit: car.contactCoinLimit,
    status: car.status,
    createdAt: car.createdAt
  };

  if (isOwner || isAdmin) {
    baseData.ownerId = car.ownerId;
    baseData.paidUntil = car.paidUntil;
    baseData.updatedAt = car.updatedAt;
    baseData.isExpired = car.paidUntil ? new Date() > new Date(car.paidUntil) : false;
    baseData.daysRemaining = car.paidUntil ? Math.ceil((new Date(car.paidUntil) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  }

  return baseData;
};

//  CREATE CAR 
export const createCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { title, description, carType, brand, model, year, rentPrice, location, contactCoinLimit, durationDays } = req.body;

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
        description: `Paid ${totalCoinsNeeded} coins for ${durationDays} days of car listing`
      }
    });

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
      contactCoinLimit: parseInt(contactCoinLimit) || 0,
      postingFeeId: null,
      paidUntil: paidUntil,
      status: 'active'
    };

    const car = await saveCarToDatabase(carData);

    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true }
    });

    const formattedResponse = {
      id: car.id,
      title: car.title,
      description: car.description,
      carType: car.carType,
      brand: car.brand,
      model: car.model,
      year: car.year,
      rentPrice: car.rentPrice,
      location: {
        city: car.location.city,
        subCity: car.location.subCity,
        placeName: car.location.placeName,
        fullAddress: `${car.location.placeName || ''} ${car.location.subCity || ''} ${car.location.city || ''}`.trim()
      },
      images: car.images,
      contactCoinLimit: car.contactCoinLimit,
      status: car.status,
      createdAt: car.createdAt,
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

    return successResponse(res, `Dear ${userFullName}, your car listing '${title}' has been posted successfully for ${durationDays} days.`, { car: formattedResponse }, 201);
  } catch (error) {
    console.error('Create car error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE CAR 
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { title, description, carType, brand, model, year, rentPrice, location, contactCoinLimit, status } = req.body;

    const existingCar = await findCarById(id);

    if (!existingCar) {
      return errorResponse(res, 'Car not found', null, 404);
    }

    if (!isAdmin && existingCar.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this car', null, 403);
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
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = parseInt(contactCoinLimit);
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingCar.images, ...newImageUrls];
    }

    const updatedCar = await updateCarInDatabase(id, updateData);

    const formattedCar = formatCarResponse(updatedCar, !isAdmin, isAdmin);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your car has been updated successfully`, { car: formattedCar });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE CAR STATUS 
export const updateCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Status must be active or inactive', null, 400);
    }

    const existingCar = await findCarById(id);

    if (!existingCar) {
      return errorResponse(res, 'Car not found', null, 404);
    }

    if (!isAdmin && existingCar.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this car status', null, 403);
    }

    const updatedCar = await updateCarInDatabase(id, { status });

    return successResponse(res, `Car status updated to ${status} successfully`, {
      id: updatedCar.id,
      status: updatedCar.status,
      updatedAt: updatedCar.updatedAt
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET ALL CARS (Public - Active only) 
export const getAllCars = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const allCars = await findAllActiveCars();
    
    const total = allCars.length;
    const cars = allCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, false, false));

    return successResponse(res, `Retrieved ${formattedCars.length} cars successfully`, {
      cars: formattedCars,
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

//  GET MY CARS (User - own cars) 
export const getMyCars = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const allCars = await findAllCars();
    
    const myCars = allCars.filter(car => car.ownerId === userId);
    const total = myCars.length;
    const cars = myCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, true, false));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, you have ${formattedCars.length} of ${total} cars`, {
      cars: formattedCars,
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

//  ADMIN GET ALL CARS 
export const adminGetAllCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let allCars = await findAllCars();
    
    if (status && status !== 'all') {
      allCars = allCars.filter(car => car.status === status);
    }
    
    const total = allCars.length;
    const cars = allCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, false, true));

    return successResponse(res, `Retrieved ${formattedCars.length} cars successfully`, {
      cars: formattedCars,
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

//  GET CAR BY ID 
export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await findCarById(id);

    if (!car) {
      return errorResponse(res, 'Car not found', null, 404);
    }

    if (car.status !== 'active') {
      return errorResponse(res, 'Car not available', null, 404);
    }

    const formattedCar = formatCarResponse(car, false, false);

    return successResponse(res, 'Car retrieved successfully', { car: formattedCar });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  SEARCH CARS (Public - Active only) 
export const searchCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, carType, brand, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allCars = await findAllActiveCars();

    if (carType) allCars = allCars.filter(c => c.carType === carType);
    if (brand) allCars = allCars.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
    if (city) allCars = allCars.filter(c => c.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) allCars = allCars.filter(c => c.rentPrice >= parseFloat(minPrice));
    if (maxPrice) allCars = allCars.filter(c => c.rentPrice <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      allCars = allCars.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allCars.length;
    const cars = allCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, false, false));

    return successResponse(res, `Found ${formattedCars.length} cars`, {
      cars: formattedCars,
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

//  SEARCH USER CARS (Dashboard) 
export const searchUserCars = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, carType, brand, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allCars = await findAllCars();

    let filteredCars = allCars.filter(car => {
      return car.status === 'active' || car.ownerId === userId;
    });

    if (carType) filteredCars = filteredCars.filter(c => c.carType === carType);
    if (brand) filteredCars = filteredCars.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
    if (city) filteredCars = filteredCars.filter(c => c.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) filteredCars = filteredCars.filter(c => c.rentPrice >= parseFloat(minPrice));
    if (maxPrice) filteredCars = filteredCars.filter(c => c.rentPrice <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCars = filteredCars.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredCars.length;
    const cars = filteredCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, car.ownerId === userId, false));

    return successResponse(res, `Found ${formattedCars.length} cars`, {
      cars: formattedCars,
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

//  SEARCH ADMIN CARS (Admin Dashboard) 
export const searchAdminCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, carType, brand, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    let allCars = await findAllCars();

    if (status && status !== 'all') allCars = allCars.filter(c => c.status === status);
    if (carType) allCars = allCars.filter(c => c.carType === carType);
    if (brand) allCars = allCars.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
    if (city) allCars = allCars.filter(c => c.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) allCars = allCars.filter(c => c.rentPrice >= parseFloat(minPrice));
    if (maxPrice) allCars = allCars.filter(c => c.rentPrice <= parseFloat(maxPrice));
    if (search) {
      const searchLower = search.toLowerCase();
      allCars = allCars.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allCars.length;
    const cars = allCars.slice(skip, skip + parseInt(limit));
    const formattedCars = cars.map(car => formatCarResponse(car, false, true));

    return successResponse(res, `Found ${formattedCars.length} cars`, {
      cars: formattedCars,
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