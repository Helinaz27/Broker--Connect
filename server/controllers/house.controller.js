import * as houseService from '../services/houseService.js';
import {
    createHouseListingValidation,
    updateHouseListingValidation,
    statusUpdateValidation,
    renewListingValidation
} from '../validations/houseValidation.js';
import { COIN_RULES } from '../utils/constants.js'; 

export const createListing = async (req, res) => {
    try {
        const { error, value } = createHouseListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await houseService.createHouseListing(req.user.id, value);

        res.status(201).json({
            success: true,
            message: 'House listing created successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllListings = async (req, res) => {
    try {
        const result = await houseService.getAllHouses(req.query);

        res.status(200).json({
            success: true,
            message: 'House listings retrieved successfully',
            data: result.listings,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getListingById = async (req, res) => {
    try {
        const listing = await houseService.getHouseById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'House listing retrieved successfully',
            data: listing
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateListing = async (req, res) => {
    try {
        const { error, value } = updateHouseListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await houseService.updateHouseListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'House listing updated successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteListing = async (req, res) => {
    try {
        await houseService.deleteHouseListing(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            message: 'House listing deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { error, value } = statusUpdateValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await houseService.updateListingStatus(
            req.params.id,
            req.user.id,
            value.status
        );

        res.status(200).json({
            success: true,
            message: 'House listing status updated successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const requestContact = async (req, res) => {
    try {
        const result = await houseService.requestContactInfo(
            req.user.id,
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: result.alreadyPaid ? 'Contact info retrieved (already paid)' : 'Contact info retrieved successfully',
            data: result.contactInfo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const renewListing = async (req, res) => {
    try {
        const { error, value } = renewListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await houseService.renewListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'House listing renewed successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};