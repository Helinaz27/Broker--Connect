import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { COIN_RULES } from '../utils/constants.js';

//  HELPER FUNCTIONS 

const getListingModel = (listingType) => {
  switch (listingType) {
    case 'house':
      return prisma.houseListing;
    case 'car':
      return prisma.carListing;
    case 'service':
      return prisma.serviceListing;
    default:
      return null;
  }
};

//  USER CONTACT ACCESS CONTROLLERS 

export const accessContact = async (req, res) => {
  try {
    const viewerId = req.user.id;
    const { listingId, listingType, ownerId } = req.body;

    // Cannot access your own contact
    if (viewerId === ownerId) {
      return errorResponse(res, 'You cannot access your own contact information', null, 400);
    }

    // Check if already has active access
    const existingAccess = await prisma.contactAccess.findFirst({
      where: {
        viewerId,
        listingId,
        isActive: true
      }
    });

    if (existingAccess) {
      return successResponse(res, 'You already have access to this contact', {
        contactAccess: existingAccess
      });
    }

    // Get the listing to check contact coin limit
    const listingModel = getListingModel(listingType);
    if (!listingModel) {
      return errorResponse(res, 'Invalid listing type', null, 400);
    }

    const listing = await listingModel.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return errorResponse(res, 'Listing not found', null, 404);
    }

    const contactCoinLimit = listing.contactCoinLimit || COIN_RULES.SYSTEM_CONTACT_FEE;

    // Check if viewer has enough coins
    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { coins: true }
    });

    if (!viewer || viewer.coins < contactCoinLimit) {
      return errorResponse(res, `Insufficient coins. Need ${contactCoinLimit} coins to access this contact`, null, 400);
    }

    // Deduct coins from viewer
    await prisma.user.update({
      where: { id: viewerId },
      data: {
        coins: {
          decrement: contactCoinLimit
        }
      }
    });

    // Add coins to owner
    await prisma.user.update({
      where: { id: ownerId },
      data: {
        coins: {
          increment: contactCoinLimit
        }
      }
    });

    // Create contact access record
    const contactAccess = await prisma.contactAccess.create({
      data: {
        viewerId,
        ownerId,
        listingId,
        listingType,
        coinsPaid: contactCoinLimit,
        isActive: true
      }
    });

    // Record coin transactions
    await prisma.coinTransaction.create({
      data: {
        userId: viewerId,
        type: 'debit',
        amount: contactCoinLimit,
        Reason: 'contact_access',
        description: `Paid ${contactCoinLimit} coins to access contact for ${listingType} listing`
      }
    });

    await prisma.coinTransaction.create({
      data: {
        userId: ownerId,
        type: 'credit',
        amount: contactCoinLimit,
        Reason: 'contact_access',
        description: `Received ${contactCoinLimit} coins from contact access for ${listingType} listing`
      }
    });

    // Get owner's contact info
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        phone: true,
        email: true
      }
    });

    return successResponse(res, 'Contact access granted', {
      contactAccess,
      contactInfo: {
        phone: owner.phone,
        email: owner.email
      }
    }, 201);
  } catch (error) {
    console.error('Access contact error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyAccesses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      prisma.contactAccess.findMany({
        where: { viewerId: userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactAccess.count({ where: { viewerId: userId } })
    ]);

    return successResponse(res, `Retrieved ${accesses.length} contact accesses`, {
      contactAccesses: accesses,
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

export const checkAccess = async (req, res) => {
  try {
    const viewerId = req.user.id;
    const { listingId } = req.params;

    const access = await prisma.contactAccess.findFirst({
      where: {
        viewerId,
        listingId,
        isActive: true
      }
    });

    let ownerInfo = null;
    if (access) {
      const owner = await prisma.user.findUnique({
        where: { id: access.ownerId },
        select: {
          phone: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });
      ownerInfo = owner;
    }

    return successResponse(res, 'Access check completed', {
      hasAccess: !!access,
      contactInfo: ownerInfo,
      accessDetails: access
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN CONTACT ACCESS CONTROLLERS 

export const adminGetAllAccesses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      prisma.contactAccess.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactAccess.count()
    ]);

    return successResponse(res, `Retrieved ${accesses.length} contact accesses`, {
      contactAccesses: accesses,
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

export const adminGetAccessesByListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      prisma.contactAccess.findMany({
        where: { listingId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactAccess.count({ where: { listingId } })
    ]);

    return successResponse(res, `Retrieved ${accesses.length} accesses for listing`, {
      contactAccesses: accesses,
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