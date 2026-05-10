import { prisma } from '../config/db.config.js';

export const findAllActiveHouses = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'active',
    OR: [
      { paidUntil: null },
      { paidUntil: { gt: new Date() } }
    ]
  };

  const [houses, total] = await Promise.all([
    prisma.houseListing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            phone: true
          }
        }
      }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};

export const searchActiveHouses = async (filters) => {
  const {
    page = 1,
    limit = 10,
    listingMode,
    houseType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    search,
    status,
    includeAllStatuses = false
  } = filters;

  const skip = (page - 1) * limit;
  const where = {};

  if (includeAllStatuses && status) {
    where.status = status;
  } else {
    where.status = 'active';
    where.OR = [
      { paidUntil: null },
      { paidUntil: { gt: new Date() } }
    ];
  }

  if (listingMode) where.listingMode = listingMode;
  if (houseType) where.houseType = houseType;
  if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
  if (city) where.city = city;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [houses, total] = await Promise.all([
    prisma.houseListing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            phone: true
          }
        }
      }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};

export const findHouseById = async (id) => {
  const house = await prisma.houseListing.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          phone: true
        }
      }
    }
  });

  if (!house) {
    throw new Error('House not found');
  }

  return house;
};

export const saveHouseToDatabase = async (data, ownerId) => {
  let postingFee = null;

  if (data.postingFeeId) {
    postingFee = await prisma.postingFee.findUnique({
      where: { id: data.postingFeeId }
    });

    if (!postingFee) {
      throw new Error('Posting fee not found');
    }

    if (!postingFee.isActive) {
      throw new Error('Selected posting fee is no longer active');
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { coins: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const contactCoinLimit = parseInt(data.contactCoinLimit) || 0;
  const postingFeePrice  = postingFee ? Math.ceil(postingFee.price) : 0;
  const totalCoinsNeeded = contactCoinLimit + postingFeePrice;

  if (user.coins < totalCoinsNeeded) {
    throw new Error(
      `Insufficient coins. You need ${totalCoinsNeeded} coins (${postingFeePrice} for posting fee + ${contactCoinLimit} for contact limit) but have ${user.coins}`
    );
  }

  let paidUntilDate = null;

  if (data.paidUntil) {
    const days = parseInt(data.paidUntil);
    if (isNaN(days) || days < 1) {
      throw new Error('paidUntil must be a positive number of days');
    }
    const future = new Date();
    future.setDate(future.getDate() + days);
    paidUntilDate = future;
  } else if (postingFee) {
    // fallback: use posting fee duration if no explicit paidUntil sent
    const future = new Date();
    future.setDate(future.getDate() + postingFee.durationDays);
    paidUntilDate = future;
  }

  const createData = {
    title:            data.title,
    description:      data.description,
    listingMode:      data.listingMode,
    houseType:        data.houseType,
    images:           data.images || [],
    price:            parseFloat(data.price),
    bedrooms:         parseInt(data.bedrooms)  || 0,
    bathrooms:        parseInt(data.bathrooms) || 0,
    area_sqm:         parseInt(data.area_sqm)  || 0,
    tanker:           data.tanker === 'true' || data.tanker === true,
    parking:          parseInt(data.parking)   || 0,
    contactCoinLimit,
    ownerId,
    status:           'active',
    paidUntil:        paidUntilDate,
    location: {
      city:        data.location?.city      || data.city      || '',
      subCity:     data.location?.subCity   || data.subCity   || null,
      placeName:   data.location?.placeName || data.placeName || null,
      coordinates: data.location?.coordinates
        ? {
            lat: parseFloat(data.location.coordinates.lat),
            lng: parseFloat(data.location.coordinates.lng),
          }
        : undefined,
    },
  };

  if (data.listingMode === 'rent' && data.rentalPeriod) {
    createData.rentalPeriod = data.rentalPeriod;
  } else {
    createData.rentalPeriod = null;
  }

  if (data.postingFeeId) {
    createData.postingFeeId = data.postingFeeId;
  }

  const [house] = await prisma.$transaction([
    prisma.houseListing.create({
      data: createData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    }),

    ...(postingFeePrice > 0 ? [
      prisma.user.update({
        where: { id: ownerId },
        data: { coins: { decrement: postingFeePrice } }
      }),
      prisma.coinTransaction.create({
        data: {
          userId:      ownerId,
          type:        'debit',
          amount:      postingFeePrice,
          Reason:      'posting_fee',
          description: `Posting fee paid for house listing — ${postingFee.durationDays} days`
        }
      })
    ] : [])
  ]);

  return house;
};

export const findHousesByOwnerId = async (ownerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const where = { ownerId };

  const [houses, total] = await Promise.all([
    prisma.houseListing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};
export const updateHouseInDatabase = async (id, data, userId, isAdmin = false) => {
  const existingHouse = await prisma.houseListing.findUnique({
    where: { id },
    select: { ownerId: true, paidUntil: true, postingFeeId: true, location: true }
  });

  if (!existingHouse) {
    throw new Error('House not found');
  }

  if (!isAdmin && existingHouse.ownerId !== userId) {
    throw new Error('You do not have permission to update this house');
  }

  const updateData = {};

  if (data.paidUntil !== undefined && !isAdmin) {
    const extraDays = parseInt(data.paidUntil);

    if (isNaN(extraDays) || extraDays < 1) {
      throw new Error('paidUntil must be a positive number of days to extend');
    }

    let pricePerDay = 1; // default fallback: 1 coin per day
    if (existingHouse.postingFeeId) {
      const postingFee = await prisma.postingFee.findUnique({
        where: { id: existingHouse.postingFeeId },
        select: { price: true, durationDays: true }
      });
      if (postingFee) {
        pricePerDay = postingFee.price / postingFee.durationDays;
      }
    }

    const coinsNeeded = Math.ceil(pricePerDay * extraDays);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user || user.coins < coinsNeeded) {
      throw new Error(
        `Insufficient coins to extend listing. You need ${coinsNeeded} coins for ${extraDays} extra days but have ${user?.coins || 0}`
      );
    }

    const baseDate = existingHouse.paidUntil && existingHouse.paidUntil > new Date()
      ? new Date(existingHouse.paidUntil)  // extend from existing expiry
      : new Date();                         // expired already — extend from today

    baseDate.setDate(baseDate.getDate() + extraDays);
    updateData.paidUntil = baseDate;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: coinsNeeded } }
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type:        'debit',
          amount:      coinsNeeded,
          Reason:      'posting_fee',
          description: `Extended house listing by ${extraDays} days`
        }
      })
    ]);
  }

  if (data.paidUntil !== undefined && isAdmin) {
    const extraDays = parseInt(data.paidUntil);
    const baseDate = existingHouse.paidUntil && existingHouse.paidUntil > new Date()
      ? new Date(existingHouse.paidUntil)
      : new Date();
    baseDate.setDate(baseDate.getDate() + extraDays);
    updateData.paidUntil = baseDate;
  }

  if (data.title           !== undefined) updateData.title           = data.title;
  if (data.description     !== undefined) updateData.description     = data.description;
  if (data.listingMode     !== undefined) updateData.listingMode     = data.listingMode;
  if (data.houseType       !== undefined) updateData.houseType       = data.houseType;
  if (data.images          !== undefined) updateData.images          = data.images;
  if (data.price           !== undefined) updateData.price           = parseFloat(data.price);
  if (data.rentalPeriod    !== undefined) updateData.rentalPeriod    = data.rentalPeriod;
  if (data.bedrooms        !== undefined) updateData.bedrooms        = parseInt(data.bedrooms);
  if (data.bathrooms       !== undefined) updateData.bathrooms       = parseInt(data.bathrooms);
  if (data.area_sqm        !== undefined) updateData.area_sqm        = parseInt(data.area_sqm);
  if (data.tanker          !== undefined) updateData.tanker          = data.tanker === 'true' || data.tanker === true;
  if (data.parking         !== undefined) updateData.parking         = parseInt(data.parking);
  if (data.contactCoinLimit !== undefined) updateData.contactCoinLimit = parseInt(data.contactCoinLimit);

  if (data.location) {
    updateData.location = {
      city:      data.location.city      ?? existingHouse.location.city,
      subCity:   data.location.subCity   ?? existingHouse.location.subCity,
      placeName: data.location.placeName ?? existingHouse.location.placeName,
      coordinates: data.location.coordinates
        ? {
            lat: parseFloat(data.location.coordinates.lat),
            lng: parseFloat(data.location.coordinates.lng),
          }
        : existingHouse.location.coordinates,
    };
  }

  const house = await prisma.houseListing.update({
    where: { id },
    data: updateData,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return house;
};

export const updateHouseStatusInDatabase = async (id, status, userId, isAdmin = false) => {
  const existingHouse = await prisma.houseListing.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!existingHouse) {
    throw new Error('House not found');
  }

  if (!isAdmin && existingHouse.ownerId !== userId) {
    throw new Error('You do not have permission to update this house status');
  }

  // user can only set these statuses
  if (!isAdmin) {
    const allowedStatuses = ['active', 'inactive', 'occupied'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Users cannot set status to ${status}. Allowed: active, inactive, occupied`);
    }
  }

  return await prisma.houseListing.update({
    where: { id },
    data: { status },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};

export const deleteHouseFromDatabase = async (id, userId, isAdmin = false) => {
  const existingHouse = await prisma.houseListing.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!existingHouse) {
    throw new Error('House not found');
  }

  if (!isAdmin && existingHouse.ownerId !== userId) {
    throw new Error('You do not have permission to delete this house');
  }

  return await prisma.houseListing.delete({ where: { id } });
};

export const findAllHouses = async (page = 1, limit = 10, status = null) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const [houses, total] = await Promise.all([
    prisma.houseListing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};

export const searchAllHouses = async (filters) => {
  return await searchActiveHouses({ ...filters, includeAllStatuses: true });
};