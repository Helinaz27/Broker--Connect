import HouseListing from '../models/HouseListing.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import ContactAccess from '../models/ContactAccess.js';
import { COIN_RULES, TRANSACTION_REASONS } from '../utils/constants.js';

export const createHouseListing = async (userId, listingData) => {
    const user = await User.findById(userId);
    if (user.coins < COIN_RULES.POSTING_FEE) {
        throw new Error(`Insufficient coins. Need ${COIN_RULES.POSTING_FEE} coins to post.`);
    }

    user.coins -= COIN_RULES.POSTING_FEE;
    await user.save();

    await CoinTransaction.create({
        userId: userId,
        type: 'debit',
        amount: COIN_RULES.POSTING_FEE,
        reason: TRANSACTION_REASONS.POSTING_FEE,
        description: `Paid ${COIN_RULES.POSTING_FEE} coins for house listing: ${listingData.title}`
    });

    if (listingData.images && listingData.images.length > COIN_RULES.MAX_IMAGES_PER_LISTING) {
        throw new Error(`Maximum ${COIN_RULES.MAX_IMAGES_PER_LISTING} images allowed per listing`);
    }

    const listing = await HouseListing.create({
        ...listingData,
        ownerId: userId
    });

    return listing;
};

export const getAllHouses = async (query) => {
    const {
        page = 1,
        limit = 10,
        city,
        subCity,
        houseType,
        minPrice,
        maxPrice,
        status = 'active'
    } = query;

    const filter = { status };

    if (city) filter['location.city'] = city;
    if (subCity) filter['location.subCity'] = subCity;
    if (houseType) filter.houseType = houseType;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const listings = await HouseListing.find(filter)
        .populate('ownerId', 'firstname lastname profileImage level')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await HouseListing.countDocuments(filter);

    return {
        listings,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getHouseById = async (id) => {
    const listing = await HouseListing.findById(id)
        .populate('ownerId', 'firstname lastname profileImage level email phone');

    if (!listing) {
        throw new Error('House listing not found');
    }

    return listing;
};

export const updateHouseListing = async (id, userId, updateData) => {
    const listing = await HouseListing.findOneAndUpdate(
        { _id: id, ownerId: userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!listing) {
        throw new Error('House listing not found or unauthorized');
    }

    return listing;
};

export const deleteHouseListing = async (id, userId) => {
    const listing = await HouseListing.findOneAndDelete({
        _id: id,
        ownerId: userId
    });

    if (!listing) {
        throw new Error('House listing not found or unauthorized');
    }

    return listing;
};

export const updateListingStatus = async (id, userId, status) => {
    const listing = await HouseListing.findOneAndUpdate(
        { _id: id, ownerId: userId },
        { status },
        { new: true }
    );

    if (!listing) {
        throw new Error('House listing not found or unauthorized');
    }

    return listing;
};

export const requestContactInfo = async (viewerId, listingId) => {
    const listing = await HouseListing.findById(listingId).populate('ownerId');

    if (!listing) {
        throw new Error('House listing not found');
    }

    const existingAccess = await ContactAccess.findOne({
        viewerId,
        listingId,
        listingType: 'house'
    });

    if (existingAccess) {
        return {
            contactInfo: {
                firstname: listing.ownerId.firstname,
                lastname: listing.ownerId.lastname,
                phone: listing.ownerId.phone,
                email: listing.ownerId.email
            },
            alreadyPaid: true
        };
    }

    const totalCost = COIN_RULES.SYSTEM_CONTACT_FEE + (listing.contactCoinLimit || 0);

    const viewer = await User.findById(viewerId);
    if (viewer.coins < totalCost) {
        throw new Error(`Insufficient coins. Need ${totalCost} coins to contact (${COIN_RULES.SYSTEM_CONTACT_FEE} system fee + ${listing.contactCoinLimit || 0} owner limit)`);
    }

    viewer.coins -= totalCost;
    await viewer.save();

    await CoinTransaction.create({
        userId: viewerId,
        type: 'debit',
        amount: totalCost,
        reason: TRANSACTION_REASONS.CONTACT_ACCESS,
        description: `Paid ${totalCost} coins (${COIN_RULES.SYSTEM_CONTACT_FEE} system + ${listing.contactCoinLimit || 0} owner) to contact house listing owner: ${listing.title}`,
        listingId: listingId,
        listingType: 'house'
    });

    await ContactAccess.create({
        viewerId,
        ownerId: listing.ownerId._id,
        listingId,
        listingType: 'house',
        coinsPaid: totalCost,
        isActive: true
    });

    return {
        contactInfo: {
            firstname: listing.ownerId.firstname,
            lastname: listing.ownerId.lastname,
            phone: listing.ownerId.phone,
            email: listing.ownerId.email
        },
        alreadyPaid: false,
        totalCost
    };
};

export const renewListing = async (id, userId, renewData) => {
    const user = await User.findById(userId);
    if (user.coins < COIN_RULES.POSTING_FEE) {
        throw new Error(`Insufficient coins. Need ${COIN_RULES.POSTING_FEE} coins to renew.`);
    }

    user.coins -= COIN_RULES.POSTING_FEE;
    await user.save();

    await CoinTransaction.create({
        userId,
        type: 'debit',
        amount: COIN_RULES.POSTING_FEE,
        reason: TRANSACTION_REASONS.POSTING_FEE,
        description: `Renewed house listing for ${COIN_RULES.POSTING_FEE} coins`
    });

    const listing = await HouseListing.findOneAndUpdate(
        { _id: id, ownerId: userId },
        {
            paidUntil: renewData.paidUntil,
            status: 'active'
        },
        { new: true }
    );

    if (!listing) {
        throw new Error('House listing not found or unauthorized');
    }

    return listing;
};