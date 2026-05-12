import { prisma } from '../config/db.config.js';

const buildPagination = (page, limit, total) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  pages: Math.ceil(total / parseInt(limit)),
});

export const createPlatformFee = async ({ feeType, category, listingMode, durationDays, price, coinAmount, description, adminId }) => {
  const isPosting = feeType === 'posting_fee';
  const isContact = feeType === 'contact_access_fee';

  if (isPosting && (category === 'house' || category === 'car') && !listingMode) {
    const error = new Error('Listing mode is required for house and car posting fees');
    error.statusCode = 400;
    throw error;
  }

  if (isPosting && (!price || !durationDays)) {
    const error = new Error('Price and duration days are required for posting fees');
    error.statusCode = 400;
    throw error;
  }

  if (isContact && coinAmount === undefined) {
    const error = new Error('Coin amount is required for contact access fees');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.platformFee.create({
    data: {
      feeType,
      category:     category     ?? null,
      listingMode:  listingMode  ?? null,
      durationDays: durationDays ? parseInt(durationDays) : null,
      price:        price        ? parseFloat(price)      : null,
      coinAmount:   coinAmount   !== undefined ? parseInt(coinAmount) : null,
      description:  description  ?? null,
      isActive: true,
      createdBy: adminId,
    },
  });
};

export const getAllPlatformFees = async ({ page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [platformFees, total] = await Promise.all([
    prisma.platformFee.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.platformFee.count(),
  ]);

  return { platformFees, pagination: buildPagination(page, limit, total) };
};

export const searchPlatformFees = async ({ feeType, category, listingMode, isActive, page = 1, limit = 20 }) => {
  const where = {};
  if (feeType)              where.feeType     = feeType;
  if (category)             where.category    = category;
  if (listingMode)          where.listingMode = listingMode;
  if (isActive !== undefined) where.isActive  = isActive === 'true' || isActive === true;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [platformFees, total] = await Promise.all([
    prisma.platformFee.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.platformFee.count({ where }),
  ]);

  return { platformFees, pagination: buildPagination(page, limit, total) };
};

export const getPlatformFeeById = async (id) => {
  const platformFee = await prisma.platformFee.findUnique({ where: { id } });
  if (!platformFee) {
    const error = new Error('Platform fee not found');
    error.statusCode = 404;
    throw error;
  }
  return platformFee;
};

export const updatePlatformFee = async (id, body) => {
  const existing = await prisma.platformFee.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Platform fee not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (body.category     !== undefined) updateData.category     = body.category;
  if (body.listingMode  !== undefined) updateData.listingMode  = body.listingMode;
  if (body.durationDays !== undefined) updateData.durationDays = parseInt(body.durationDays);
  if (body.price        !== undefined) updateData.price        = parseFloat(body.price);
  if (body.coinAmount   !== undefined) updateData.coinAmount   = parseInt(body.coinAmount);
  if (body.description  !== undefined) updateData.description  = body.description;
  if (body.isActive     !== undefined) updateData.isActive     = body.isActive;
  updateData.updatedAt = new Date();

  return await prisma.platformFee.update({ where: { id }, data: updateData });
};

export const deletePlatformFee = async (id) => {
  const existing = await prisma.platformFee.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Platform fee not found');
    error.statusCode = 404;
    throw error;
  }
  return await prisma.platformFee.delete({ where: { id } });
};