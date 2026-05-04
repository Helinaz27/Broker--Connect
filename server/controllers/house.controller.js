import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  saveHouseToDatabase,
  findHouseById,
  findAllHouses,
  findAllActiveHouses,
  updateHouseInDatabase
} from '../services/house.service.js';

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


    // Fetch active posting fee for house
const postingFee = await prisma.postingFee.findFirst({
  where: {
    category: 'house',
    isActive: true
  }
});

if (!postingFee) {
  return errorResponse(res, 'No active posting fee found for house listings. Please contact admin.', null, 400);
}

const POSTING_RATE_PER_DAY = postingFee.price;

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

    // ✅ USING SERVICE
    const house = await saveHouseToDatabase(houseData);

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
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { title, description, houseType, price, location, contactCoinLimit, status } = req.body;

    // ✅ USING SERVICE
    const existingHouse = await findHouseById(id);

    if (!existingHouse) {
      return errorResponse(res, 'House not found', null, 404);
    }

    if (!isAdmin && existingHouse.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this house', null, 403);
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

    // ✅ USING SERVICE
    const updatedHouse = await updateHouseInDatabase(id, updateData);

    const formattedHouse = formatHouseResponse(updatedHouse, !isAdmin, isAdmin);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your house has been updated successfully`, { house: formattedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  UPDATE HOUSE STATUS 

export const updateHouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles || [];
    const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Status must be active or inactive', null, 400);
    }

    // ✅ USING SERVICE
    const existingHouse = await findHouseById(id);

    if (!existingHouse) {
      return errorResponse(res, 'House not found', null, 404);
    }

    if (!isAdmin && existingHouse.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this house status', null, 403);
    }

    // ✅ USING SERVICE
    const updatedHouse = await updateHouseInDatabase(id, { status });

    return successResponse(res, `House status updated to ${status} successfully`, {
      id: updatedHouse.id,
      status: updatedHouse.status,
      updatedAt: updatedHouse.updatedAt
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  GET ALL HOUSES (Public - Active only) 

export const getAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    const allHouses = await findAllActiveHouses();
    
    const total = allHouses.length;
    const houses = allHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));

    return successResponse(res, `Retrieved ${formattedHouses.length} houses successfully`, {
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

//  GET MY HOUSES (User - own houses) 

export const getMyHouses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    const allHouses = await findAllHouses();
    
    const myHouses = allHouses.filter(house => house.ownerId === userId);
    const total = myHouses.length;
    const houses = myHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => formatHouseResponse(house, true, false));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, you have ${formattedHouses.length} of ${total} houses`, {
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

//  ADMIN GET ALL HOUSES 

export const adminGetAllHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    let allHouses = await findAllHouses();
    
    if (status && status !== 'all') {
      allHouses = allHouses.filter(house => house.status === status);
    }
    
    const total = allHouses.length;
    const houses = allHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => formatHouseResponse(house, false, true));

    return successResponse(res, `Retrieved ${formattedHouses.length} houses successfully`, {
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

//  GET HOUSE BY ID 

export const getHouseById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ USING SERVICE
    const house = await findHouseById(id);

    if (!house) {
      return errorResponse(res, 'House not found', null, 404);
    }

    if (house.status !== 'active') {
      return errorResponse(res, 'House not available', null, 404);
    }

    const formattedHouse = formatHouseResponse(house, false, false);

    return successResponse(res, 'House retrieved successfully', { house: formattedHouse });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  SEARCH HOUSES (Public - Active only) 

export const searchHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, houseType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    let allHouses = await findAllActiveHouses();

    // Apply filters (business logic in controller)
    if (houseType) {
      allHouses = allHouses.filter(h => h.houseType === houseType);
    }
    if (city) {
      allHouses = allHouses.filter(h => h.location?.city?.toLowerCase() === city.toLowerCase());
    }
    if (minPrice) {
      allHouses = allHouses.filter(h => h.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      allHouses = allHouses.filter(h => h.price <= parseFloat(maxPrice));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allHouses = allHouses.filter(h => 
        h.title.toLowerCase().includes(searchLower) ||
        h.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allHouses.length;
    const houses = allHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => formatHouseResponse(house, false, false));

    return successResponse(res, `Found ${formattedHouses.length} houses`, {
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

//  SEARCH USER HOUSES (Dashboard) 

export const searchUserHouses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, houseType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    let allHouses = await findAllHouses();

    // Filter: active OR user's own houses
    let filteredHouses = allHouses.filter(house => {
      return house.status === 'active' || house.ownerId === userId;
    });

    // Apply filters
    if (houseType) {
      filteredHouses = filteredHouses.filter(h => h.houseType === houseType);
    }
    if (city) {
      filteredHouses = filteredHouses.filter(h => h.location?.city?.toLowerCase() === city.toLowerCase());
    }
    if (minPrice) {
      filteredHouses = filteredHouses.filter(h => h.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredHouses = filteredHouses.filter(h => h.price <= parseFloat(maxPrice));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredHouses = filteredHouses.filter(h => 
        h.title.toLowerCase().includes(searchLower) ||
        h.description.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredHouses.length;
    const houses = filteredHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => 
      formatHouseResponse(house, house.ownerId === userId, false)
    );

    return successResponse(res, `Found ${formattedHouses.length} houses`, {
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

//  SEARCH ADMIN HOUSES (Admin Dashboard) 

export const searchAdminHouses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, houseType, city, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    // ✅ USING SERVICE
    let allHouses = await findAllHouses();

    // Apply filters
    if (status && status !== 'all') {
      allHouses = allHouses.filter(h => h.status === status);
    }
    if (houseType) {
      allHouses = allHouses.filter(h => h.houseType === houseType);
    }
    if (city) {
      allHouses = allHouses.filter(h => h.location?.city?.toLowerCase() === city.toLowerCase());
    }
    if (minPrice) {
      allHouses = allHouses.filter(h => h.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      allHouses = allHouses.filter(h => h.price <= parseFloat(maxPrice));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allHouses = allHouses.filter(h => 
        h.title.toLowerCase().includes(searchLower) ||
        h.description.toLowerCase().includes(searchLower)
      );
    }

    const total = allHouses.length;
    const houses = allHouses.slice(skip, skip + parseInt(limit));
    const formattedHouses = houses.map(house => formatHouseResponse(house, false, true));

    return successResponse(res, `Found ${formattedHouses.length} houses`, {
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