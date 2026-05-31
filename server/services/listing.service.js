import { prisma } from "../config/db.config.js";

const ownerSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
  },
};

const buildWhereClause = (filters = {}) => {
  const where = {};
  const andClauses = [];

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.excludeExpired) {
    andClauses.push({
      OR: [{ paidUntil: null }, { paidUntil: { gt: new Date() } }],
    });
  }

  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.listingMode) where.listingMode = filters.listingMode;
  if (filters.houseType) where.houseType = filters.houseType;
  if (filters.carType) where.carType = filters.carType;
  if (filters.condition) where.condition = filters.condition;
  if (filters.serviceType) where.serviceType = filters.serviceType;
  if (filters.rentalPeriod) where.rentalPeriod = filters.rentalPeriod;

  if (filters.bedrooms !== undefined)
    where.bedrooms = parseInt(filters.bedrooms);
  if (filters.bathrooms !== undefined)
    where.bathrooms = parseInt(filters.bathrooms);

  if (filters.minArea || filters.maxArea) {
    where.area_sqm = {};
    if (filters.minArea) where.area_sqm.gte = parseInt(filters.minArea);
    if (filters.maxArea) where.area_sqm.lte = parseInt(filters.maxArea);
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
  }

  if (filters.city) {
    where.location = {
      is: {
        city: { equals: filters.city, mode: "insensitive" },
      },
    };
  }

  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: "insensitive" };
  }

  if (filters.search) {
    andClauses.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  return where;
};

export const createListing = async (listingData) => {
  const { ownerId, ...restData } = listingData;

  const data = ownerId
    ? {
        owner: { connect: { id: ownerId } },
        ...restData,
      }
    : restData;

  return await prisma.listing.create({ data });
};

export const getListingById = async (id) => {
  return await prisma.listing.findUnique({
    where: { id },
    include: { owner: ownerSelect },
  });
};

export const getPaginatedListings = async ({
  filters = {},
  page = 1,
  limit = 20,
} = {}) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = buildWhereClause(filters);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { owner: ownerSelect },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total };
};

export const updateListing = async (id, updateData) => {
  return await prisma.listing.update({
    where: { id },
    data: updateData,
    include: { owner: ownerSelect },
  });
};

export const renewListing = async (id, newPaidUntil) => {
  return await prisma.listing.update({
    where: { id },
    data: {
      paidUntil: newPaidUntil,
      status: "active",
    },
    include: { owner: ownerSelect },
  });
};
