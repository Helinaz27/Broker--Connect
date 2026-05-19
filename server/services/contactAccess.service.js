import { prisma } from '../config/db.config.js';

export const accessContactService = async (viewerId, listingId) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) throw { status: 404, message: 'Listing not found' };
  if (listing.status !== 'active') throw { status: 400, message: 'Listing is not active' };
  if (listing.ownerId === viewerId) throw { status: 400, message: 'You cannot access your own listing contact' };

  const existing = await prisma.contactAccess.findFirst({
    where: { viewerId, listingId, isActive: true },
  });
  if (existing) return existing;

  const coinCost = listing.contactCoinLimit;

  if (coinCost <= 0) throw { status: 400, message: 'This listing has no contact access fee configured' };

  // Fix 1: Fetch fresh coins from DB instead of relying on stale req.user.coins
  const viewer = await prisma.user.findUnique({ where: { id: viewerId } });
  if (!viewer) throw { status: 404, message: 'User not found' };

  if (viewer.coins < coinCost) {
    throw {
      status: 400,
      message: `Insufficient coins. You need ${coinCost} coins but have ${viewer.coins}`,
    };
  }

  const [, contactAccess] = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: viewerId },
      data: { coins: { decrement: coinCost } },
    });

    const access = await tx.contactAccess.create({
      data: {
        viewerId,
        ownerId: listing.ownerId,
        listingId,
        coinsPaid: coinCost,
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId: viewerId,
        type: 'debit',
        amount: coinCost,
        reason: 'contact_access',
        description: `Paid ${coinCost} coins to unlock contact for listing: "${listing.title}"`,
      },
    });

    await tx.notification.create({
      data: {
        userId: viewerId,
        type: 'contact_access',
        title: 'Contact Unlocked',
        body: `You successfully unlocked the contact for "${listing.title}". ${coinCost} coins deducted from your balance.`,
        path: `/listings/${listingId}`,
        referenceId: access.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: listing.ownerId,
        type: 'contact_access',
        title: 'Someone Unlocked Your Listing',
        body: `Someone has unlocked your contact information on listing "${listing.title}".`,
        path: `/listings/${listingId}`,
        referenceId: access.id,
      },
    });

    return [updatedUser, access];
  });

  return contactAccess;
};

export const getMyAccessesService = async (viewerId, page, limit) => {
  const skip = (page - 1) * limit;

  const [accesses, total] = await Promise.all([
    prisma.contactAccess.findMany({
      where: { viewerId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            listingType: true,
            listingMode: true,
            price: true,
            location: true,
            images: true,
            status: true,
            contactCoinLimit: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactAccess.count({ where: { viewerId } }),
  ]);

  return { accesses, total };
};

export const adminGetAllAccessesService = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [accesses, total] = await Promise.all([
    prisma.contactAccess.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            listingType: true,
            price: true,
            location: true,
            contactCoinLimit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactAccess.count(),
  ]);

  return { accesses, total };
};

export const adminGetAccessesByListingService = async (listingId, page, limit) => {
  const skip = (page - 1) * limit;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw { status: 404, message: 'Listing not found' };

  const [accesses, total] = await Promise.all([
    prisma.contactAccess.findMany({
      where: { listingId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            listingType: true,
            price: true,
            location: true,
            contactCoinLimit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactAccess.count({ where: { listingId } }),
  ]);

  return { accesses, total };
};

export const adminGetAccessesByUserService = async (userId, page, limit) => {
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 404, message: 'User not found' };

  const [accesses, total] = await Promise.all([
    prisma.contactAccess.findMany({
      where: { viewerId: userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            listingType: true,
            price: true,
            location: true,
            contactCoinLimit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactAccess.count({ where: { viewerId: userId } }),
  ]);

  return { accesses, total };
};