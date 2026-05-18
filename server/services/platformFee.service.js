import { prisma } from '../config/db.config.js';

const buildPagination = (page, limit, total) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  pages: Math.ceil(total / parseInt(limit)),
});

const buildUniquenessWhere = (feeType, category, listingMode) => {
  const needsMode = (category === 'house' || category === 'car') && listingMode;

  return {
    feeType,
    category: category ?? null,
    listingMode: needsMode ? listingMode : null,
  };
};

const checkForDuplicate = async (feeType, category, listingMode, excludeId = null) => {
  const where = buildUniquenessWhere(feeType, category, listingMode);
  if (excludeId) where.id = { not: excludeId };

  const existing = await prisma.platformFee.findFirst({ where });

  if (existing) {
    const label = existing.listingMode
      ? `${feeType} / ${category} / ${existing.listingMode}`
      : `${feeType} / ${category}`;

    const error = new Error(
      `A platform fee for [${label}] already exists (id: ${existing.id}). ` +
      `Update the existing record instead of creating a new one.`
    );
    error.statusCode = 409;
    error.existingId = existing.id;
    throw error;
  }
};

export const createPlatformFee = async ({
  feeType, category, listingMode, durationDays,
  coinAmount, description, adminId,
}) => {
  const isPosting = feeType === 'posting_fee';
  const isContact = feeType === 'contact_access_fee';

  if ((isPosting || isContact) && (category === 'house' || category === 'car') && !listingMode) {
    const error = new Error('Listing mode is required for house and car fees');
    error.statusCode = 400;
    throw error;
  }

  if (isPosting && !durationDays) {
    const error = new Error('Duration days is required for posting fees');
    error.statusCode = 400;
    throw error;
  }

  if (coinAmount === undefined || coinAmount === null) {
    const error = new Error('Coin amount is required');
    error.statusCode = 400;
    throw error;
  }

  await checkForDuplicate(feeType, category, listingMode);

  return await prisma.platformFee.create({
    data: {
      feeType,
      category: category ?? null,
      listingMode: listingMode ?? null,
      durationDays: durationDays ? parseInt(durationDays) : null,
      coinAmount: parseInt(coinAmount),
      description: description ?? null,
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

export const searchPlatformFees = async ({
  q, feeType, category, listingMode, isActive, page = 1, limit = 20,
}) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (feeType) where.feeType = feeType;
  if (category) where.category = category;
  if (listingMode) where.listingMode = listingMode;
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

  let platformFees = await prisma.platformFee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (q) {
    const regex = new RegExp(q, 'i');
    platformFees = platformFees.filter(fee =>
      regex.test(fee.description ?? '') ||
      regex.test(fee.feeType ?? '') ||
      regex.test(fee.category ?? '')
    );
  }

  const total = platformFees.length;
  const paginated = platformFees.slice(skip, skip + take);

  return { platformFees: paginated, pagination: buildPagination(page, limit, total) };
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

  const newFeeType = body.feeType ?? existing.feeType;
  const newCategory = body.category ?? existing.category;
  const newListingMode = body.listingMode ?? existing.listingMode;

  const combinationChanged =
    newFeeType !== existing.feeType ||
    newCategory !== existing.category ||
    newListingMode !== existing.listingMode;

  if (combinationChanged) {
    await checkForDuplicate(newFeeType, newCategory, newListingMode, id);
  }

  const updateData = {};
  if (body.category !== undefined) updateData.category = body.category;
  if (body.listingMode !== undefined) updateData.listingMode = body.listingMode;
  if (body.durationDays !== undefined) updateData.durationDays = parseInt(body.durationDays);
  if (body.coinAmount !== undefined) updateData.coinAmount = parseInt(body.coinAmount);
  if (body.description !== undefined) updateData.description = body.description;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
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