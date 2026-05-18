import { prisma } from '../config/db.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { COIN_RULES } from '../utils/constants.js';
import {
  saveContactAccessToDatabase,
  findAccessByViewerAndListing,
  findAccessByViewer,
  countAccessByViewer,
  findAccessByListing,
  countAccessByListing,
  findAllContactAccesses,
  countAllContactAccesses,
  findAccessByUser,
  countAccessByUser
} from '../services/contactAccess.service.js';

const SYSTEM_CONTACT_FEE = COIN_RULES.SYSTEM_CONTACT_FEE || 10;

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

const formatContactAccessResponse = (access, includeViewer = false, includeOwner = false) => {
  const baseData = {
    id: access.id,
    listingId: access.listingId,
    listingType: access.listingType,
    coinsPaid: access.coinsPaid,
    isActive: access.isActive,
    createdAt: access.createdAt
  };

  if (includeViewer && access.viewer) {
    baseData.viewer = {
      id: access.viewer.id,
      firstName: access.viewer.firstName,
      lastName: access.viewer.lastName,
      email: access.viewer.email,
      phone: access.viewer.phone
    };
  }

  if (includeOwner && access.owner) {
    baseData.owner = {
      id: access.owner.id,
      firstName: access.owner.firstName,
      lastName: access.owner.lastName,
      email: access.owner.email,
      phone: access.owner.phone
    };
  }

  return baseData;
};

//  USER CONTACT ACCESS CONTROLLERS 

export const accessContact = async (req, res) => {
  try {
    const viewerId = req.user.id;
    const viewerFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { listingId, listingType } = req.body;

    // Cannot access your own listing
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

    if (listing.ownerId === viewerId) {
      return errorResponse(res, 'You cannot access your own listing contact', null, 400);
    }

    // Check if already has active access
    const existingAccess = await findAccessByViewerAndListing(viewerId, listingId);

    if (existingAccess && existingAccess.isActive) {
      // Return owner contact info directly
      const owner = await prisma.user.findUnique({
        where: { id: listing.ownerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      });
      return successResponse(res, `Dear ${viewerFullName}, you already have access to this contact`, {
        hasAccess: true,
        contactInfo: {
          phone: owner.phone,
          email: owner.email,
          name: `${owner.firstName} ${owner.lastName}`
        },
        accessDetails: {
          accessedAt: existingAccess.createdAt,
          coinsPaid: existingAccess.coinsPaid
        }
      });
    }

    // Calculate total coins needed
    const ownerCoinLimit = listing.contactCoinLimit || 0;
    const totalCoinsNeeded = SYSTEM_CONTACT_FEE + ownerCoinLimit;

    // Check if viewer has enough coins
    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { coins: true }
    });

    if (!viewer || viewer.coins < totalCoinsNeeded) {
      return errorResponse(res, `Insufficient coins. Need ${totalCoinsNeeded} coins (System fee: ${SYSTEM_CONTACT_FEE}, Owner fee: ${ownerCoinLimit}). Please buy more coins.`, null, 400);
    }

    // Deduct total coins from viewer
    await prisma.user.update({
      where: { id: viewerId },
      data: { coins: { decrement: totalCoinsNeeded } }
    });

    // Add ownerCoinLimit to owner's balance
    if (ownerCoinLimit > 0) {
      await prisma.user.update({
        where: { id: listing.ownerId },
        data: { coins: { increment: ownerCoinLimit } }
      });
    }

    const contactAccess = await saveContactAccessToDatabase({
      viewerId: viewerId,
      ownerId: listing.ownerId,
      listingId: listingId,
      listingType: listingType,
      coinsPaid: totalCoinsNeeded,
      isActive: true
    });

    await prisma.coinTransaction.create({
      data: {
        userId: viewerId,
        type: 'debit',
        amount: totalCoinsNeeded,
        Reason: 'contact_access',
        description: `Paid ${totalCoinsNeeded} coins to access contact for ${listingType} listing ${listingId}`
      }
    });

    if (ownerCoinLimit > 0) {
      await prisma.coinTransaction.create({
        data: {
          userId: listing.ownerId,
          type: 'credit',
          amount: ownerCoinLimit,
          Reason: 'contact_access',
          description: `Received ${ownerCoinLimit} coins from contact access for ${listingType} listing ${listingId}`
        }
      });
    }

    const owner = await prisma.user.findUnique({
      where: { id: listing.ownerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true
      }
    });

    if (ownerCoinLimit > 0) {
      await prisma.notification.create({
        data: {
          userId: listing.ownerId,
          Type: 'new_contact',
          title: 'New Contact Access',
          body: `${viewerFullName} paid ${ownerCoinLimit} coins to access your contact for listing: ${listing.title}`,
          isRead: false
        }
      });
    }

    const formattedAccess = formatContactAccessResponse(contactAccess, false, false);

    return successResponse(res, `Dear ${viewerFullName}, you have successfully paid ${totalCoinsNeeded} coins to access contact information.`, {
      contactAccess: formattedAccess,
      contactInfo: {
        name: `${owner.firstName} ${owner.lastName}`,
        phone: owner.phone,
        email: owner.email
      },
      paymentSummary: {
        systemFee: SYSTEM_CONTACT_FEE,
        ownerFee: ownerCoinLimit,
        totalPaid: totalCoinsNeeded,
        remainingCoins: viewer.coins - totalCoinsNeeded
      },
      expiresIn: "Lifetime access for this listing"
    }, 201);
  } catch (error) {
    console.error('Access contact error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyAccesses = async (req, res) => {
  try {
    const viewerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      findAccessByViewer(viewerId, parseInt(skip), parseInt(limit)),
      countAccessByViewer(viewerId)
    ]);

    const formattedAccesses = await Promise.all(
      accesses.map(async (access) => {
        // Get listing title
        const listingModel = getListingModel(access.listingType);
        let listingTitle = '';
        if (listingModel) {
          const listing = await listingModel.findUnique({
            where: { id: access.listingId },
            select: { title: true }
          });
          listingTitle = listing?.title || '';
        }
        return {
          id: access.id,
          listingId: access.listingId,
          listingType: access.listingType,
          listingTitle: listingTitle,
          coinsPaid: access.coinsPaid,
          isActive: access.isActive,
          accessedAt: access.createdAt
        };
      })
    );

    return successResponse(res, `Retrieved ${formattedAccesses.length} contact accesses`, {
      accesses: formattedAccesses,
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


export const adminGetAllAccesses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      findAllContactAccesses(parseInt(skip), parseInt(limit)),
      countAllContactAccesses()
    ]);

    const formattedAccesses = await Promise.all(
      accesses.map(async (access) => {
        const viewer = await prisma.user.findUnique({
          where: { id: access.viewerId },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        });
        const owner = await prisma.user.findUnique({
          where: { id: access.ownerId },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        });
        const listingModel = getListingModel(access.listingType);
        let listingTitle = '';
        if (listingModel) {
          const listing = await listingModel.findUnique({
            where: { id: access.listingId },
            select: { title: true }
          });
          listingTitle = listing?.title || '';
        }
        return {
          id: access.id,
          listingId: access.listingId,
          listingType: access.listingType,
          listingTitle: listingTitle,
          coinsPaid: access.coinsPaid,
          isActive: access.isActive,
          createdAt: access.createdAt,
          viewer: viewer ? { name: `${viewer.firstName} ${viewer.lastName}`, email: viewer.email } : null,
          owner: owner ? { name: `${owner.firstName} ${owner.lastName}`, email: owner.email } : null
        };
      })
    );

    return successResponse(res, `Retrieved ${formattedAccesses.length} contact accesses`, {
      accesses: formattedAccesses,
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
      findAccessByListing(listingId, parseInt(skip), parseInt(limit)),
      countAccessByListing(listingId)
    ]);

    const formattedAccesses = await Promise.all(
      accesses.map(async (access) => {
        const viewer = await prisma.user.findUnique({
          where: { id: access.viewerId },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        });
        return {
          id: access.id,
          viewer: viewer ? { name: `${viewer.firstName} ${viewer.lastName}`, email: viewer.email } : null,
          coinsPaid: access.coinsPaid,
          isActive: access.isActive,
          createdAt: access.createdAt
        };
      })
    );

    return successResponse(res, `Retrieved ${formattedAccesses.length} accesses for listing`, {
      accesses: formattedAccesses,
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

export const adminGetAccessesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      findAccessByUser(userId, parseInt(skip), parseInt(limit)),
      countAccessByUser(userId)
    ]);

    const formattedAccesses = accesses.map(access => ({
      id: access.id,
      listingId: access.listingId,
      listingType: access.listingType,
      coinsPaid: access.coinsPaid,
      isActive: access.isActive,
      createdAt: access.createdAt
    }));

    return successResponse(res, `Retrieved ${formattedAccesses.length} accesses for user`, {
      accesses: formattedAccesses,
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