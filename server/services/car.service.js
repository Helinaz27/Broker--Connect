import Car from '../models/Car.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import ContactAccess from '../models/ContactAccess.js';
import { COIN_RULES, TRANSACTION_REASONS } from '../utils/constants.js';

export const createCarListing = async (userId, listingData) => {
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
        description: `Paid ${COIN_RULES.POSTING_FEE} coins for car listing: ${listingData.title}`
    });

    if (listingData.images && listingData.images.length > COIN_RULES.MAX_IMAGES_PER_LISTING) {
        throw new Error(`Maximum ${COIN_RULES.MAX_IMAGES_PER_LISTING} images allowed per listing`);
    }

    const listing = await Car.create({
        ...listingData,
        ownerId: userId,
        user_id: userId 
    });

    return listing;
};

export const getAllCars = async (query) => {
    const {
        page = 1,
        limit = 10,
        city,
        carType,
        brand,
        minPrice,
        maxPrice,
        listing_type,
        status = 'active'
    } = query;

    const filter = { status };

    if (city) filter['location.city'] = city;
    if (carType) filter.carType = carType;
    if (brand) filter.brand = brand;
    if (listing_type) filter.listing_type = listing_type;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const listings = await Car.find(filter)
        .populate('ownerId', 'firstname lastname profileImage level')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await Car.countDocuments(filter);

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

export const getCarById = async (id) => {
    const listing = await Car.findById(id)
        .populate('ownerId', 'firstname lastname profileImage level email phone');

    if (!listing) {
        throw new Error('Car listing not found');
    }

    return listing;
};

export const updateCarListing = async (id, userId, updateData) => {
    const listing = await Car.findOneAndUpdate(
        { _id: id, ownerId: userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!listing) {
        throw new Error('Car listing not found or unauthorized');
    }

    return listing;
};

export const deleteCarListing = async (id, userId) => {
    const listing = await Car.findOneAndDelete({
        _id: id,
        ownerId: userId
    });

    if (!listing) {
        throw new Error('Car listing not found or unauthorized');
    }

    return listing;
};

export const updateListingStatus = async (id, userId, status) => {
    const listing = await Car.findOneAndUpdate(
        { _id: id, ownerId: userId },
        { status },
        { new: true }
    );

    if (!listing) {
        throw new Error('Car listing not found or unauthorized');
    }

    return listing;
};

export const requestContactInfo = async (viewerId, listingId) => {
    const listing = await Car.findById(listingId).populate('ownerId');

    if (!listing) {
        throw new Error('Car listing not found');
    }

    const existingAccess = await ContactAccess.findOne({
        viewerId,
        listingId,
        listingType: 'car'
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
        description: `Paid ${totalCost} coins (${COIN_RULES.SYSTEM_CONTACT_FEE} system + ${listing.contactCoinLimit || 0} owner) to contact car listing owner: ${listing.title}`,
        listingId: listingId,
        listingType: 'car'
    });

    await ContactAccess.create({
        viewerId,
        ownerId: listing.ownerId._id,
        listingId,
        listingType: 'car',
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
        description: `Renewed car listing for ${COIN_RULES.POSTING_FEE} coins`
    });

    const listing = await Car.findOneAndUpdate(
        { _id: id, ownerId: userId },
        {
            paidUntil: renewData.paidUntil,
            status: 'active'
        },
        { new: true }
    );

    if (!listing) {
        throw new Error('Car listing not found or unauthorized');
    }

    return listing;
};