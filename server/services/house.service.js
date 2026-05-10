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

  // Status filter
  if (includeAllStatuses && status) {
    where.status = status;
  } else {
    where.status = 'active';
    where.OR = [
      { paidUntil: null },
      { paidUntil: { gt: new Date() } }
    ];
  }

  // Apply filters
  if (listingMode) where.listingMode = listingMode;
  if (houseType) where.houseType = houseType;
  if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
  if (city) where.city = city;
  
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Text search
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
      },
      postingFee: true
    }
  });

  if (!house) {
    throw new Error('House not found');
  }

  return house;
};
export const saveHouseToDatabase = async (data, ownerId) => {
  if (data.contactCoinLimit && data.contactCoinLimit > 0) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { coins: true }
    });

    if (!user || user.coins < data.contactCoinLimit) {
      throw new Error('Insufficient coins to set this contact coin limit');
    }
  }

  const createData = {
    title: data.title,
    description: data.description,
    listingMode: data.listingMode,
    houseType: data.houseType,
    images: data.images || [],
    price: parseFloat(data.price),
    bedrooms: parseInt(data.bedrooms) || 0,
    bathrooms: parseInt(data.bathrooms) || 0,
    area_sqm: parseInt(data.area_sqm) || 0,
    tanker: data.tanker === 'true' || data.tanker === true,
    parking: parseInt(data.parking) || 0,
    contactCoinLimit: parseInt(data.contactCoinLimit) || 0,
    ownerId: ownerId,
    status: 'active',

    location: {
      city:      data.location?.city      || data.city      || '',
      subCity:   data.location?.subCity   || data.subCity   || null,
      placeName: data.location?.placeName || data.placeName || null,
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

  if (data.paidUntil) {
    createData.paidUntil = new Date(data.paidUntil);
  }

  if (data.postingFeeId) {
    createData.postingFeeId = data.postingFeeId;
  }

  const house = await prisma.houseListing.create({
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
  });
  
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
      orderBy: { createdAt: 'desc' },
      include: {
        postingFee: true
      }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};


export const updateHouseInDatabase = async (id, data, userId, isAdmin = false) => {
  // Check if house exists and user owns it (or is admin)
  const existingHouse = await prisma.houseListing.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!existingHouse) {
    throw new Error('House not found');
  }

  if (!isAdmin && existingHouse.ownerId !== userId) {
    throw new Error('You do not have permission to update this house');
  }

  // Prepare update data
  const updateData = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.listingMode !== undefined) updateData.listingMode = data.listingMode;
  if (data.houseType !== undefined) updateData.houseType = data.houseType;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.rentalPeriod !== undefined) updateData.rentalPeriod = data.rentalPeriod;
  if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
  if (data.area_sqm !== undefined) updateData.area_sqm = data.area_sqm;
  if (data.tanker !== undefined) updateData.tanker = data.tanker;
  if (data.parking !== undefined) updateData.parking = data.parking;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.subCity !== undefined) updateData.subCity = data.subCity;
  if (data.placeName !== undefined) updateData.placeName = data.placeName;
  if (data.contactCoinLimit !== undefined) updateData.contactCoinLimit = data.contactCoinLimit;
  if (data.paidUntil !== undefined) updateData.paidUntil = data.paidUntil ? new Date(data.paidUntil) : null;
  
  // Status update with permission check
  if (data.status !== undefined) {
    if (isAdmin) {
      updateData.status = data.status;
    } else {
      const allowedStatuses = ['active', 'inactive', 'occupied'];
      if (allowedStatuses.includes(data.status)) {
        updateData.status = data.status;
      } else {
        throw new Error(`Users cannot set status to ${data.status}`);
      }
    }
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

export const deleteHouseFromDatabase = async (id, userId, isAdmin = false) => {
  // Check if house exists
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

  const house = await prisma.houseListing.delete({
    where: { id }
  });

  return house;
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
        },
        postingFee: true
      }
    }),
    prisma.houseListing.count({ where })
  ]);

  return { houses, total, page, limit };
};

export const searchAllHouses = async (filters) => {
  return await searchActiveHouses({ ...filters, includeAllStatuses: true });
};