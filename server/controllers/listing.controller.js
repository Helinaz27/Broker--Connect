import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import {
  createListing,
  getListingById,
  getAllListings,
  getAllActiveListings,
  updateListing
} from '../services/listing.service.js';

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'listings', resource_type: 'image' },
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

const formatListingResponse = (listing, isOwner = false, isAdmin = false) => {
  const base = {
    id: listing.id,
    listingType: listing.listingType,
    listingMode: listing.listingMode,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    images: listing.images,
    location: {
      city: listing.location?.city,
      subCity: listing.location?.subCity,
      placeName: listing.location?.placeName,
      coordinates: listing.location?.coordinates,
      fullAddress: `${listing.location?.placeName || ''} ${listing.location?.subCity || ''} ${listing.location?.city || ''}`.trim()
    },
    contactCoinLimit: listing.contactCoinLimit,
    status: listing.status,
    createdAt: listing.createdAt,
    owner: listing.owner
      ? {
          id: listing.owner.id,
          name: `${listing.owner.firstName} ${listing.owner.lastName}`,
          phone: listing.owner.phone,
          email: listing.owner.email
        }
      : undefined
  };

  if (listing.listingType === 'house') {
    base.houseType = listing.houseType;
    base.bedrooms = listing.bedrooms;
    base.bathrooms = listing.bathrooms;
    base.area_sqm = listing.area_sqm;
    base.tanker = listing.tanker;
    base.parking = listing.parking;
    base.rentalPeriod = listing.rentalPeriod;
  }

  if (listing.listingType === 'car') {
    base.carType = listing.carType;
    base.condition = listing.condition;
    base.brand = listing.brand;
    base.carModel = listing.carModel;
  }

  if (listing.listingType === 'service') {
    base.serviceType = listing.serviceType;
  }

  if (isOwner || isAdmin) {
    base.ownerId = listing.ownerId;
    base.paidUntil = listing.paidUntil;
    base.updatedAt = listing.updatedAt;
    base.isExpired = listing.paidUntil ? new Date() > new Date(listing.paidUntil) : false;
    base.daysRemaining = listing.paidUntil
      ? Math.ceil((new Date(listing.paidUntil) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;
  }

  return base;
};

export const createListingCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const {
      listingType, listingMode, title, description, price, location, contactCoinLimit, durationDays,
      houseType, bedrooms, bathrooms, area_sqm, tanker, parking, rentalPeriod,
      carType, condition, brand, carModel,
      serviceType
    } = req.body;

    if (!durationDays || durationDays < 1) {
      return errorResponse(res, 'Duration days is required and must be at least 1 day', null, 400);
    }

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    const postingFee = await prisma.platformFee.findFirst({
      where: { feeType: 'posting_fee', category: listingType, isActive: true }
    });

    if (!postingFee) {
      return errorResponse(res, `No active posting fee found for ${listingType} listings. Please contact admin.`, null, 400);
    }

    const totalCoinsNeeded = parseInt(durationDays) * postingFee.coinAmount;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });

    if (!user || user.coins < totalCoinsNeeded) {
      return errorResponse(res, `Insufficient coins. Need ${totalCoinsNeeded} coins for ${durationDays} days. Please buy coins first.`, null, 400);
    }

    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + parseInt(durationDays));

    await prisma.user.update({ where: { id: userId }, data: { coins: { decrement: totalCoinsNeeded } } });

    await prisma.coinTransaction.create({
      data: {
        userId,
        type: 'debit',
        amount: totalCoinsNeeded,
        reason: 'posting_fee',
        description: `Paid ${totalCoinsNeeded} coins for ${durationDays} days of ${listingType} listing`
      }
    });

    const listingData = {
      ownerId: userId,
      listingType,
      title,
      description,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: parseInt(contactCoinLimit) || 0,
      paidUntil,
      status: 'active',
      ...(listingMode && { listingMode }),
      ...(listingType === 'house' && {
        houseType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area_sqm: parseInt(area_sqm),
        tanker: Boolean(tanker),
        parking: parking !== undefined ? parseInt(parking) : null,
        rentalPeriod: rentalPeriod || null
      }),
      ...(listingType === 'car' && {
        carType,
        condition,
        brand,
        carModel
      }),
      ...(listingType === 'service' && { serviceType })
    };

    const listing = await createListing(listingData);

    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true }
    });

    listing.owner = owner;

    const formattedResponse = formatListingResponse(listing, true, false);

    return successResponse(
      res,
      `Dear ${userFullName}, your ${listingType} listing '${title}' has been posted successfully for ${durationDays} days.`,
      {
        listing: {
          ...formattedResponse,
          postingDetails: {
            durationDays: parseInt(durationDays),
            totalCoinsPaid: totalCoinsNeeded,
            paidUntil,
            expiresIn: `${durationDays} days`,
            isActive: true
          },
          currentCoinsRemaining: user.coins - totalCoinsNeeded
        }
      },
      201
    );
  } catch (error) {
    console.error('Create listing error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateListingCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = (req.user.roles || []).includes('admin');
    const {
      title, description, price, listingMode, location, contactCoinLimit, status,
      houseType, bedrooms, bathrooms, area_sqm, tanker, parking, rentalPeriod,
      carType, condition, brand, carModel,
      serviceType
    } = req.body;

    const existingListing = await getListingById(id);

    if (!existingListing) {
      return errorResponse(res, 'Listing not found', null, 404);
    }

    if (!isAdmin && existingListing.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this listing', null, 403);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (listingMode !== undefined) updateData.listingMode = listingMode;
    if (status !== undefined) updateData.status = status;
    if (contactCoinLimit !== undefined) updateData.contactCoinLimit = parseInt(contactCoinLimit);
    if (location !== undefined) {
      updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
    }

    if (existingListing.listingType === 'house') {
      if (houseType !== undefined) updateData.houseType = houseType;
      if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
      if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms);
      if (area_sqm !== undefined) updateData.area_sqm = parseInt(area_sqm);
      if (tanker !== undefined) updateData.tanker = Boolean(tanker);
      if (parking !== undefined) updateData.parking = parseInt(parking);
      if (rentalPeriod !== undefined) updateData.rentalPeriod = rentalPeriod;
    }

    if (existingListing.listingType === 'car') {
      if (carType !== undefined) updateData.carType = carType;
      if (condition !== undefined) updateData.condition = condition;
      if (brand !== undefined) updateData.brand = brand;
      if (carModel !== undefined) updateData.carModel = carModel;
    }

    if (existingListing.listingType === 'service') {
      if (serviceType !== undefined) updateData.serviceType = serviceType;
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingListing.images, ...newImageUrls];
    }

    const updatedListing = await updateListing(id, updateData);
    const formatted = formatListingResponse(updatedListing, !isAdmin, isAdmin);

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, your listing has been updated successfully`, { listing: formatted });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const updateListingStatusCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = (req.user.roles || []).includes('admin');
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Status must be active or inactive', null, 400);
    }

    const existingListing = await getListingById(id);

    if (!existingListing) {
      return errorResponse(res, 'Listing not found', null, 404);
    }

    if (!isAdmin && existingListing.ownerId !== userId) {
      return errorResponse(res, 'You are not authorized to update this listing status', null, 403);
    }

    const updated = await updateListing(id, { status });

    return successResponse(res, `Listing status updated to ${status} successfully`, {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getAllListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, listingType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllActiveListings();
    if (listingType) listings = listings.filter(l => l.listingType === listingType);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, false, false));

    return successResponse(res, `Retrieved ${formatted.length} listings successfully`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyListingsCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, listingType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllListings();
    listings = listings.filter(l => l.ownerId === userId);
    if (listingType) listings = listings.filter(l => l.listingType === listingType);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, true, false));

    return successResponse(res, `Dear ${req.user.firstName} ${req.user.lastName}, you have ${formatted.length} of ${total} listings`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const adminGetAllListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, listingType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllListings();
    if (status && status !== 'all') listings = listings.filter(l => l.status === status);
    if (listingType) listings = listings.filter(l => l.listingType === listingType);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, false, true));

    return successResponse(res, `Retrieved ${formatted.length} listings successfully`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getListingByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await getListingById(id);

    if (!listing) {
      return errorResponse(res, 'Listing not found', null, 404);
    }

    if (listing.status !== 'active') {
      return errorResponse(res, 'Listing not available', null, 404);
    }

    return successResponse(res, 'Listing retrieved successfully', { listing: formatListingResponse(listing, false, false) });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const searchListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, listingType, listingMode, city, minPrice, maxPrice, search,
      houseType, bedrooms, bathrooms, minArea, maxArea,
      carType, condition, brand, serviceType, rentalPeriod } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllActiveListings();

    if (listingType) listings = listings.filter(l => l.listingType === listingType);
    if (listingMode) listings = listings.filter(l => l.listingMode === listingMode);
    if (city) listings = listings.filter(l => l.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) listings = listings.filter(l => l.price >= parseFloat(minPrice));
    if (maxPrice) listings = listings.filter(l => l.price <= parseFloat(maxPrice));
    if (search) {
      const s = search.toLowerCase();
      listings = listings.filter(l => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
    }
    if (houseType) listings = listings.filter(l => l.houseType === houseType);
    if (bedrooms !== undefined) listings = listings.filter(l => l.bedrooms === parseInt(bedrooms));
    if (bathrooms !== undefined) listings = listings.filter(l => l.bathrooms === parseInt(bathrooms));
    if (minArea) listings = listings.filter(l => l.area_sqm >= parseInt(minArea));
    if (maxArea) listings = listings.filter(l => l.area_sqm <= parseInt(maxArea));
    if (carType) listings = listings.filter(l => l.carType === carType);
    if (condition) listings = listings.filter(l => l.condition === condition);
    if (brand) listings = listings.filter(l => l.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (serviceType) listings = listings.filter(l => l.serviceType === serviceType);
    if (rentalPeriod) listings = listings.filter(l => l.rentalPeriod === rentalPeriod);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, false, false));

    return successResponse(res, `Found ${formatted.length} listings`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const searchUserListingsCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, listingType, listingMode, city, minPrice, maxPrice, search,
      houseType, bedrooms, bathrooms, minArea, maxArea,
      carType, condition, brand, serviceType, rentalPeriod } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllListings();
    listings = listings.filter(l => l.status === 'active' || l.ownerId === userId);

    if (listingType) listings = listings.filter(l => l.listingType === listingType);
    if (listingMode) listings = listings.filter(l => l.listingMode === listingMode);
    if (city) listings = listings.filter(l => l.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) listings = listings.filter(l => l.price >= parseFloat(minPrice));
    if (maxPrice) listings = listings.filter(l => l.price <= parseFloat(maxPrice));
    if (search) {
      const s = search.toLowerCase();
      listings = listings.filter(l => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
    }
    if (houseType) listings = listings.filter(l => l.houseType === houseType);
    if (bedrooms !== undefined) listings = listings.filter(l => l.bedrooms === parseInt(bedrooms));
    if (bathrooms !== undefined) listings = listings.filter(l => l.bathrooms === parseInt(bathrooms));
    if (minArea) listings = listings.filter(l => l.area_sqm >= parseInt(minArea));
    if (maxArea) listings = listings.filter(l => l.area_sqm <= parseInt(maxArea));
    if (carType) listings = listings.filter(l => l.carType === carType);
    if (condition) listings = listings.filter(l => l.condition === condition);
    if (brand) listings = listings.filter(l => l.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (serviceType) listings = listings.filter(l => l.serviceType === serviceType);
    if (rentalPeriod) listings = listings.filter(l => l.rentalPeriod === rentalPeriod);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, l.ownerId === userId, false));

    return successResponse(res, `Found ${formatted.length} listings`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const searchAdminListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, listingType, listingMode, city, minPrice, maxPrice, search,
      houseType, bedrooms, bathrooms, minArea, maxArea,
      carType, condition, brand, serviceType, rentalPeriod } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await getAllListings();

    if (status && status !== 'all') listings = listings.filter(l => l.status === status);
    if (listingType) listings = listings.filter(l => l.listingType === listingType);
    if (listingMode) listings = listings.filter(l => l.listingMode === listingMode);
    if (city) listings = listings.filter(l => l.location?.city?.toLowerCase() === city.toLowerCase());
    if (minPrice) listings = listings.filter(l => l.price >= parseFloat(minPrice));
    if (maxPrice) listings = listings.filter(l => l.price <= parseFloat(maxPrice));
    if (search) {
      const s = search.toLowerCase();
      listings = listings.filter(l => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
    }
    if (houseType) listings = listings.filter(l => l.houseType === houseType);
    if (bedrooms !== undefined) listings = listings.filter(l => l.bedrooms === parseInt(bedrooms));
    if (bathrooms !== undefined) listings = listings.filter(l => l.bathrooms === parseInt(bathrooms));
    if (minArea) listings = listings.filter(l => l.area_sqm >= parseInt(minArea));
    if (maxArea) listings = listings.filter(l => l.area_sqm <= parseInt(maxArea));
    if (carType) listings = listings.filter(l => l.carType === carType);
    if (condition) listings = listings.filter(l => l.condition === condition);
    if (brand) listings = listings.filter(l => l.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (serviceType) listings = listings.filter(l => l.serviceType === serviceType);
    if (rentalPeriod) listings = listings.filter(l => l.rentalPeriod === rentalPeriod);

    const total = listings.length;
    const paginated = listings.slice(skip, skip + parseInt(limit));
    const formatted = paginated.map(l => formatListingResponse(l, false, true));

    return successResponse(res, `Found ${formatted.length} listings`, {
      listings: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};