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

const formatHouseResponse = (house, isOwner = false, isAdmin = false) => {
  const baseData = {
    id: house.id,
    title: house.title,
    description: house.description,
    houseType: house.houseType,
    price: house.price,
    location: {
      city: house.location?.city,
      subCity: house.location?.subCity,
      placeName: house.location?.placeName,
      fullAddress: `${house.location?.placeName || ''} ${house.location?.subCity || ''} ${house.location?.city || ''}`.trim()
    },
    images: house.images,
    contactCoinLimit: house.contactCoinLimit,
    status: house.status,
    createdAt: house.createdAt
  };

  if (isOwner || isAdmin) {
    baseData.ownerId = house.ownerId;
    baseData.paidUntil = house.paidUntil;
    baseData.updatedAt = house.updatedAt;
    baseData.isExpired = house.paidUntil ? new Date() > new Date(house.paidUntil) : false;
    baseData.daysRemaining = house.paidUntil ? Math.ceil((new Date(house.paidUntil) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  }

  return baseData;
};

//  CREATE HOUSE 

export const createHouse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { title, description, houseType, price, location, contactCoinLimit, durationDays } = req.body;

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
        description: `Paid ${totalCoinsNeeded} coins for ${durationDays} days of house listing`
      }
    });

    const houseData = {
      ownerId: userId,
      title,
      description,
      houseType,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: parseInt(contactCoinLimit) || 0,
      postingFeeId: null,
      paidUntil: paidUntil,
      status: 'active'
    };

    const house = await prisma.houseListing.create({
      data: houseData
    });

    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true }
    });

    const formattedResponse = {
      id: house.id,
      title: house.title,
      description: house.description,
      houseType: house.houseType,
      price: house.price,
      location: {
        city: house.location.city,
        subCity: house.location.subCity,
        placeName: house.location.placeName,
        fullAddress: `${house.location.placeName || ''} ${house.location.subCity || ''} ${house.location.city || ''}`.trim()
      },
      images: house.images,
      contactCoinLimit: house.contactCoinLimit,
      status: house.status,
      createdAt: house.createdAt,
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

    return successResponse(res, `Dear ${userFullName}, your house listing '${title}' has been posted successfully for ${durationDays} days.`, { house: formattedResponse }, 201);
  } catch (error) {
    console.error('Create house error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE HOUSE 

export const updateHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, houseType, price, location, contactCoinLimit, status } = req.body;

    const existingHouse = await prisma.houseListing.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingHouse) {
      return errorResponse(res, 'House not found or unauthorized', null, 404);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (houseType !== undefined) updateData.houseType = houseType;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (location !== undefined) {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      updateData.location = parsedLocation;
    }
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = parseInt(contactCoinLimit);
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingHouse.images, ...newImageUrls];
    }

    const updatedHouse = await prisma.houseListing.update({
      where: { id },
      data: updateData
    });

    const formattedHouse = formatHouseResponse(updatedHouse, true, false);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your house updated successfully`, { house: formattedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE HOUSE STATUS 

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

    const formattedHouse = formatHouseResponse(updatedHouse, true, false);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your house status updated to ${status} successfully`, { house: formattedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET HOUSES (All Active - Public) 

export const getAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { status: 'active' };

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'User';

    return successResponse(res, `dear ${req.user.firstName} ${req.user.lastName}, you have retrieved ${formattedHouses.length} houses successfully`, {
      houses: formattedHouses,
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

//  GET MY HOUSES (User's own) 

export const getMyHouses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { ownerId: userId };

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    const formattedHouses = houses.map(house => formatHouseResponse(house, true, false));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, you have retrieved ${formattedHouses.length} of your houses from the database among ${total} houses`, {
      houses: formattedHouses,
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

//  GET HOUSES BY OWNER 

export const getHousesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { 
      ownerId: ownerId,
      status: 'active'
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

    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));

    // Get owner info
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { firstName: true, lastName: true, phone: true }
    });

    return successResponse(res, `Retrieved ${formattedHouses.length} houses by ${owner?.firstName || ''} ${owner?.lastName || ''}`, {
      owner: owner ? { name: `${owner.firstName} ${owner.lastName}`, phone: owner.phone } : null,
      houses: formattedHouses,
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

//  GET HOUSES BY TYPE 

export const getHousesByType = async (req, res) => {
  try {
    const { houseType } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { 
      houseType: houseType,
      status: 'active'
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

    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));

    return successResponse(res, `Retrieved ${formattedHouses.length} ${houseType} houses`, {
      houses: formattedHouses,
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
//get houses by city (filtering in memory due to nested location structure)
export const getHousesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all active houses first, then filter in memory
    const allHouses = await prisma.houseListing.findMany({
      where: { status: 'active' }
    });

    // Filter by city
    const filteredHouses = allHouses.filter(house => 
      house.location?.city?.toLowerCase() === city.toLowerCase()
    );

    // Apply pagination
    const paginatedHouses = filteredHouses.slice(skip, skip + parseInt(limit));
    const total = filteredHouses.length;

    const formattedHouses = paginatedHouses.map(house => formatHouseResponse(house, false, false));

    return successResponse(res, `Found ${formattedHouses.length} houses in ${city}`, {
      city: city,
      houses: formattedHouses,
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
//  GET HOUSES BY PRICE RANGE

export const getHousesByPrice = async (req, res) => {
  try {
    const { min, max } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'active',
      price: {
        gte: parseFloat(min),
        lte: parseFloat(max)
      }
    };

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { price: 'asc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));

    return successResponse(res, `Retrieved ${formattedHouses.length} houses between ${min} and ${max} Birr`, {
      priceRange: { min: parseFloat(min), max: parseFloat(max) },
      houses: formattedHouses,
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

//  ADMIN GET ALL HOUSES (Including inactive/expired) 

export const adminGetAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') where.status = status;

    const [houses, total] = await Promise.all([
      prisma.houseListing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.houseListing.count({ where })
    ]);

    const formattedHouses = houses.map(house => formatHouseResponse(house, false, true));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, Retrieved ${formattedHouses.length} houses  successfully`, {
      houses: formattedHouses,
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