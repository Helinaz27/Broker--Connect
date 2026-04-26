import * as carService from '../services/carService.js';
import {
    createCarListingValidation,
    updateCarListingValidation,
    statusUpdateValidation,
    renewListingValidation
} from '../validations/carValidation.js';
import { COIN_RULES } from '../utils/constants.js';

export const createListing = async (req, res) => {
    try {
        const { error, value } = createCarListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await carService.createCarListing(req.user.id, value);

        res.status(201).json({
            success: true,
            message: 'Car listing created successfully',
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
        const result = await carService.getAllCars(req.query);

        res.status(200).json({
            success: true,
            message: 'Car listings retrieved successfully',
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
        const listing = await carService.getCarById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Car listing retrieved successfully',
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
        const { error, value } = updateCarListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await carService.updateCarListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'Car listing updated successfully',
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
        await carService.deleteCarListing(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Car listing deleted successfully'
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

        const listing = await carService.updateListingStatus(
            req.params.id,
            req.user.id,
            value.status
        );

        res.status(200).json({
            success: true,
            message: 'Car listing status updated successfully',
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
        const result = await carService.requestContactInfo(
            req.user.id,
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: result.alreadyPaid ? 'Contact info retrieved (already paid)' : 'Contact info retrieved successfully',
            data: result.contactInfo,
            totalCost: result.totalCost
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

        const listing = await carService.renewListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'Car listing renewed successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};