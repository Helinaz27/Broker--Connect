import { prisma } from '../config/db.config.js';

const buildPagination = (page, limit, total) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  pages: Math.ceil(total / parseInt(limit)),
});


export const savePostingFee = async ({ category, listingMode, durationDays, price, description, adminId }) => {
  if ((category === 'house' || category === 'car') && !listingMode) {
    const error = new Error('listingMode (rent or sell) is required for house and car categories');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.postingFee.create({
    data: {
      category,
      listingMode: listingMode ?? null,
      durationDays: parseInt(durationDays),
      price: parseFloat(price),
      description: description ?? null,
      isActive: true,
      createdBy: adminId,
    },
  });
};

export const fetchAllPostingFees = async ({ page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [postingFees, total] = await Promise.all([
    prisma.postingFee.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.postingFee.count(),
  ]);

  return {
    postingFees,
    pagination: buildPagination(page, limit, total),
  };
};

export const modifyPostingFee = async (id, body) => {
  const existing = await prisma.postingFee.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error('Posting fee not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (body.category     !== undefined) updateData.category     = body.category;
  if (body.listingMode  !== undefined) updateData.listingMode  = body.listingMode;
  if (body.durationDays !== undefined) updateData.durationDays = parseInt(body.durationDays);
  if (body.price        !== undefined) updateData.price        = parseFloat(body.price);
  if (body.description  !== undefined) updateData.description  = body.description;
  if (body.isActive     !== undefined) updateData.isActive     = body.isActive;
  updateData.updatedAt = new Date();

  return await prisma.postingFee.update({
    where: { id },
    data: updateData,
  });
};

export const fetchPostingFeesByFilter = async ({ id, category, listingMode, isActive, page = 1, limit = 20 }) => {
  if (id) {
    const postingFee = await prisma.postingFee.findUnique({ where: { id } });
    if (!postingFee) {
      const error = new Error('Posting fee not found');
      error.statusCode = 404;
      throw error;
    }
    return { postingFee, single: true };
  }

  const where = {};
  if (category)              where.category    = category;
  if (listingMode)           where.listingMode = listingMode;
  if (isActive !== undefined) where.isActive   = isActive === 'true' || isActive === true;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [postingFees, total] = await Promise.all([
    prisma.postingFee.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.postingFee.count({ where }),
  ]);

  return {
    postingFees,
    pagination: buildPagination(page, limit, total),
    single: false,
  };
};

export const fetchPostingFeeById = async (id) => {
  const postingFee = await prisma.postingFee.findUnique({ where: { id } });

  if (!postingFee) {
    const error = new Error('Posting fee not found');
    error.statusCode = 404;
    throw error;
  }

  return postingFee;
};

//  DELETE /:id
export const removePostingFee = async (id) => {
  const existing = await prisma.postingFee.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error('Posting fee not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.postingFee.delete({ where: { id } });
};