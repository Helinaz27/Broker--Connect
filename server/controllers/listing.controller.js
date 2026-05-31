import { prisma } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import {
  createListing,
  getListingById,
  getPaginatedListings,
  updateListing,
  renewListing,
} from "../services/listing.service.js";

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "listings", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  });
  return await Promise.all(uploadPromises);
};

const formatListingResponse = (
  listing,
  isOwner = false,
  isAdmin = false,
  showContact = false,
) => {
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
      fullAddress:
        `${listing.location?.placeName || ""} ${listing.location?.subCity || ""} ${listing.location?.city || ""}`.trim(),
    },
    contactCoinLimit: listing.contactCoinLimit,
    status: listing.status,
    createdAt: listing.createdAt,
    owner: listing.owner
      ? {
          id: listing.owner.id,
          ...(showContact && {
            phone: listing.owner.phone,
            email: listing.owner.email,
          }),
        }
      : undefined,
  };

  if (listing.listingType === "house") {
    base.houseType = listing.houseType;
    base.bedrooms = listing.bedrooms;
    base.bathrooms = listing.bathrooms;
    base.area_sqm = listing.area_sqm;
    base.tanker = listing.tanker;
    base.parking = listing.parking;
    base.rentalPeriod = listing.rentalPeriod;
  }

  if (listing.listingType === "car") {
    base.carType = listing.carType;
    base.condition = listing.condition;
    base.brand = listing.brand;
    base.carModel = listing.carModel;
  }

  if (listing.listingType === "service") {
    base.serviceType = listing.serviceType;
  }

  if (isOwner || isAdmin) {
    base.ownerId = listing.ownerId;
    base.paidUntil = listing.paidUntil;
    base.updatedAt = listing.updatedAt;
    base.isExpired = listing.paidUntil
      ? new Date() > new Date(listing.paidUntil)
      : false;
    base.daysRemaining = listing.paidUntil
      ? Math.max(
          0,
          Math.ceil(
            (new Date(listing.paidUntil) - new Date()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;
  }

  return base;
};

const parseLocation = (raw) => {
  const parsed = typeof raw === "string" ? JSON.parse(raw.trim()) : raw;
  const { city, subCity, placeName, coordinates } = parsed;

  let parsedCoordinates = undefined;
  if (coordinates) {
    parsedCoordinates = {
      lat:
        typeof coordinates.lat === "string"
          ? parseFloat(coordinates.lat)
          : coordinates.lat,
      lng:
        typeof coordinates.lng === "string"
          ? parseFloat(coordinates.lng)
          : coordinates.lng,
    };
  }

  return {
    city,
    ...(subCity && { subCity }),
    ...(placeName && { placeName }),
    ...(parsedCoordinates && { coordinates: parsedCoordinates }),
  };
};

const parseBool = (val) => {
  if (typeof val === "boolean") return val;
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  return Boolean(val);
};

const isListingExpired = (listing) => {
  return listing.paidUntil && new Date() > new Date(listing.paidUntil);
};

export const createListingCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const {
      listingType,
      listingMode,
      title,
      description,
      price,
      location,
      contactCoinLimit,
      durationDays,
      houseType,
      bedrooms,
      bathrooms,
      area_sqm,
      tanker,
      parking,
      rentalPeriod,
      carType,
      condition,
      brand,
      carModel,
      serviceType,
    } = req.body;

    if (!durationDays || parseInt(durationDays) < 1) {
      return errorResponse(
        res,
        "Duration days is required and must be at least 1 day",
        null,
        400,
      );
    }

    const parsedLocation = location ? parseLocation(location) : null;

    let imageUrls = [];
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "At least one image is required", null, 400);
    }
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    const resolvedListingMode = listingMode || null;

    const postingFee = await prisma.platformFee.findFirst({
      where: {
        feeType: "posting_fee",
        category: listingType,
        ...(resolvedListingMode && { listingMode: resolvedListingMode }),
        isActive: true,
      },
    });

    if (!postingFee) {
      return errorResponse(
        res,
        `No active posting fee found for ${listingType} listings. Please contact admin.`,
        null,
        400,
      );
    }

    const contactAccessFee = await prisma.platformFee.findFirst({
      where: {
        feeType: "contact_access_fee",
        category: listingType,
        ...(resolvedListingMode && { listingMode: resolvedListingMode }),
        isActive: true,
      },
    });

    if (!contactAccessFee) {
      return errorResponse(
        res,
        `No active contact access fee found for ${listingType} listings. Please contact admin.`,
        null,
        400,
      );
    }

    const platformContactFee = contactAccessFee.coinAmount;
    const parsedContactCoinLimit = contactCoinLimit
      ? parseInt(contactCoinLimit)
      : null;
    const resolvedContactCoinLimit =
      parsedContactCoinLimit && parsedContactCoinLimit > platformContactFee
        ? parsedContactCoinLimit
        : platformContactFee;

    const totalCoinsNeeded =
      (parseInt(durationDays) * postingFee.coinAmount) /
      postingFee.durationDays;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < totalCoinsNeeded) {
      return errorResponse(
        res,
        `Insufficient coins. You need ${totalCoinsNeeded} coins for ${durationDays} days but have ${user?.coins ?? 0}. Please buy more coins.`,
        null,
        400,
      );
    }

    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + parseInt(durationDays));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: totalCoinsNeeded } },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type: "debit",
          amount: totalCoinsNeeded,
          reason: "posting_fee",
          description: `Paid ${totalCoinsNeeded} coins for ${durationDays} days of ${listingType} listing`,
        },
      }),
    ]);

    const listingData = {
      ownerId: userId,
      listingType,
      title,
      description,
      price: parseFloat(price),
      images: imageUrls,
      location: parsedLocation,
      contactCoinLimit: resolvedContactCoinLimit,
      paidUntil,
      status: "active",
      ...(listingMode && { listingMode }),
      ...(listingType === "house" && {
        houseType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area_sqm: parseInt(area_sqm),
        tanker: parseBool(tanker),
        parking:
          parking !== undefined && parking !== null ? parseInt(parking) : null,
        rentalPeriod: rentalPeriod || null,
      }),
      ...(listingType === "car" && { carType, condition, brand, carModel }),
      ...(listingType === "service" && { serviceType }),
    };

    const listing = await createListing(listingData);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    return successResponse(
      res,
      `Dear ${userFullName}, your ${listingType} listing '${title}' has been posted successfully for ${durationDays} days.`,
      {
        listing: {
          ...formatListingResponse(listing, true, false),
          postingDetails: {
            durationDays: parseInt(durationDays),
            totalCoinsPaid: totalCoinsNeeded,
            paidUntil,
            expiresIn: `${durationDays} days`,
            isActive: true,
          },
          currentCoinsRemaining: updatedUser.coins,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse(res, "Server error", error.message);
  }
};

export const updateListingCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      price,
      listingMode,
      location,
      contactCoinLimit,
      status,
      houseType,
      bedrooms,
      bathrooms,
      area_sqm,
      tanker,
      parking,
      rentalPeriod,
      carType,
      condition,
      brand,
      carModel,
      serviceType,
    } = req.body;

    const existingListing = await getListingById(id);
    if (!existingListing)
      return errorResponse(res, "Listing not found", null, 404);
    if (existingListing.ownerId !== userId) {
      return errorResponse(
        res,
        "You are not authorized to update this listing",
        null,
        403,
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (listingMode !== undefined) updateData.listingMode = listingMode;
    if (status !== undefined) updateData.status = status;
    if (contactCoinLimit !== undefined)
      updateData.contactCoinLimit = parseInt(contactCoinLimit);
    if (location !== undefined) {
      updateData.location = parseLocation(location);
    }

    if (existingListing.listingType === "house") {
      if (houseType !== undefined) updateData.houseType = houseType;
      if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
      if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms);
      if (area_sqm !== undefined) updateData.area_sqm = parseInt(area_sqm);
      if (tanker !== undefined) updateData.tanker = parseBool(tanker);
      if (parking !== undefined) updateData.parking = parseInt(parking);
      if (rentalPeriod !== undefined) updateData.rentalPeriod = rentalPeriod;
    }

    if (existingListing.listingType === "car") {
      if (carType !== undefined) updateData.carType = carType;
      if (condition !== undefined) updateData.condition = condition;
      if (brand !== undefined) updateData.brand = brand;
      if (carModel !== undefined) updateData.carModel = carModel;
    }

    if (existingListing.listingType === "service") {
      if (serviceType !== undefined) updateData.serviceType = serviceType;
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      updateData.images = [...existingListing.images, ...newImageUrls];
    }

    const updatedListing = await updateListing(id, updateData);
    const formatted = formatListingResponse(updatedListing);

    return successResponse(
      res,
      `Dear ${req.user.firstName} ${req.user.lastName}, your listing has been updated successfully`,
      { listing: formatted },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const updateListingStatusCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = (req.user.roles || []).includes("admin");
    const { status } = req.body;

    const existingListing = await getListingById(id);
    if (!existingListing)
      return errorResponse(res, "Listing not found", null, 404);

    if (!isAdmin && existingListing.ownerId !== userId) {
      return errorResponse(
        res,
        "You are not authorized to update this listing status",
        null,
        403,
      );
    }

    if (status === "active" && isListingExpired(existingListing)) {
      return errorResponse(
        res,
        "This listing has expired and cannot be set to active. Please renew your listing first.",
        null,
        400,
      );
    }

    const updated = await updateListing(id, { status });

    return successResponse(
      res,
      `Listing status updated to ${status} successfully`,
      {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const getAllListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, listingType } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters: {
        status: "active",
        excludeExpired: true,
        ...(listingType && { listingType }),
      },
      page,
      limit,
    });

    const formatted = listings.map((l) =>
      formatListingResponse(l, false, false),
    );

    return successResponse(
      res,
      `Retrieved ${formatted.length} listings successfully`,
      {
        listings: formatted,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const getMyListingsCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      listingType,
      listingMode,
      status,
    } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters: {
        ownerId: userId,
        ...(listingType && { listingType }),
        ...(listingMode && { listingMode }),
        ...(status && status !== "all" && { status }),
      },
      page,
      limit,
    });

    const formatted = listings.map((l) =>
      formatListingResponse(l, true, false),
    );

    return successResponse(
      res,
      `Dear ${req.user.firstName} ${req.user.lastName}, you have ${formatted.length} of ${total} listings`,
      {
        listings: formatted,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const adminGetAllListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, listingType } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters: {
        ...(status && { status }),
        ...(listingType && { listingType }),
      },
      page,
      limit,
    });

    const formatted = listings.map((l) =>
      formatListingResponse(l, false, true),
    );

    return successResponse(
      res,
      `Retrieved ${formatted.length} listings successfully`,
      {
        listings: formatted,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const getListingByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await getListingById(id);

    if (!listing) return errorResponse(res, "Listing not found", null, 404);
    if (listing.status !== "active")
      return errorResponse(res, "Listing not available", null, 404);
    if (isListingExpired(listing))
      return errorResponse(res, "Listing has expired", null, 404);

    const viewer = req.user ?? null;

    if (!viewer) {
      return successResponse(res, "Listing retrieved successfully", {
        listing: formatListingResponse(listing, false, false, false),
        hasContactAccess: false,
        isOwner: false,
      });
    }

    const isOwner = listing.ownerId === viewer.id;
    const isAdmin = viewer.roles.includes("admin");

    if (isOwner || isAdmin) {
      return successResponse(res, "Listing retrieved successfully", {
        listing: formatListingResponse(listing, isOwner, isAdmin, true),
        hasContactAccess: true,
        isOwner,
      });
    }

    const access = await prisma.contactAccess.findFirst({
      where: { viewerId: viewer.id, listingId: id, isActive: true },
    });

    const hasContactAccess = !!access;

    return successResponse(res, "Listing retrieved successfully", {
      listing: formatListingResponse(listing, false, false, hasContactAccess),
      hasContactAccess,
      isOwner: false,
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const searchListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters: { ...filters, status: "active", excludeExpired: true },
      page,
      limit,
    });

    const formatted = listings.map((l) =>
      formatListingResponse(l, false, false),
    );

    return successResponse(res, `Found ${total} listings`, {
      listings: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const searchUserListingsCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, ...filters } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters: { ...filters, excludeExpired: true },
      page,
      limit,
    });

    const visible = listings.filter(
      (l) => l.status === "active" || l.ownerId === userId,
    );
    const formatted = visible.map((l) =>
      formatListingResponse(l, l.ownerId === userId, false),
    );

    return successResponse(res, `Found ${formatted.length} listings`, {
      listings: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const searchAdminListingsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;

    const { listings, total } = await getPaginatedListings({
      filters,
      page,
      limit,
    });

    const formatted = listings.map((l) =>
      formatListingResponse(l, false, true),
    );

    return successResponse(res, `Found ${total} listings`, {
      listings: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const renewListingCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { durationDays } = req.body;

    const existingListing = await getListingById(id);
    if (!existingListing)
      return errorResponse(res, "Listing not found", null, 404);
    if (existingListing.ownerId !== userId)
      return errorResponse(
        res,
        "You are not authorized to renew this listing",
        null,
        403,
      );

    const postingFee = await prisma.platformFee.findFirst({
      where: {
        feeType: "posting_fee",
        category: existingListing.listingType,
        ...(existingListing.listingMode && {
          listingMode: existingListing.listingMode,
        }),
        isActive: true,
      },
    });

    if (!postingFee)
      return errorResponse(
        res,
        `No active posting fee found for ${existingListing.listingType} listings. Please contact admin.`,
        null,
        400,
      );

    const totalCoinsNeeded = Math.ceil(
      (parseInt(durationDays) * postingFee.coinAmount) /
        postingFee.durationDays,
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < totalCoinsNeeded) {
      return errorResponse(
        res,
        `Insufficient coins. You need ${totalCoinsNeeded} coins for ${durationDays} days but have ${user?.coins ?? 0}. Please buy more coins.`,
        null,
        400,
      );
    }

    const now = new Date();
    const base =
      existingListing.paidUntil && new Date(existingListing.paidUntil) > now
        ? new Date(existingListing.paidUntil)
        : now;
    const newPaidUntil = new Date(base);
    newPaidUntil.setDate(newPaidUntil.getDate() + parseInt(durationDays));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: totalCoinsNeeded } },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type: "debit",
          amount: totalCoinsNeeded,
          reason: "renewal_fee",
          description: `Paid ${totalCoinsNeeded} coins to renew listing for ${durationDays} days`,
        },
      }),
    ]);

    const updated = await renewListing(id, newPaidUntil);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    return successResponse(
      res,
      `Listing renewed successfully for ${durationDays} days.`,
      {
        listing: {
          ...formatListingResponse(updated, true, false),
          renewalDetails: {
            durationDays: parseInt(durationDays),
            totalCoinsPaid: totalCoinsNeeded,
            newPaidUntil,
            isActive: true,
          },
          currentCoinsRemaining: updatedUser.coins,
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};
