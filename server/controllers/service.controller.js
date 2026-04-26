import * as serviceService from '../services/serviceService.js';
import {
    createServiceListingValidation,
    updateServiceListingValidation,
    statusUpdateValidation,
    renewListingValidation
} from '../validations/serviceValidation.js';
import { COIN_RULES } from '../utils/constants.js';

export const createListing = async (req, res) => {
    try {
        const { error, value } = createServiceListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await serviceService.createServiceListing(req.user.id, value);

        res.status(201).json({
            success: true,
            message: 'Service listing created successfully',
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
        const result = await serviceService.getAllServices(req.query);

        res.status(200).json({
            success: true,
            message: 'Service listings retrieved successfully',
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
        const listing = await serviceService.getServiceById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Service listing retrieved successfully',
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
        const { error, value } = updateServiceListingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const listing = await serviceService.updateServiceListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'Service listing updated successfully',
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
        await serviceService.deleteServiceListing(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Service listing deleted successfully'
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

        const listing = await serviceService.updateListingStatus(
            req.params.id,
            req.user.id,
            value.status
        );

        res.status(200).json({
            success: true,
            message: 'Service listing status updated successfully',
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
        const result = await serviceService.requestContactInfo(
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

        const listing = await serviceService.renewListing(
            req.params.id,
            req.user.id,
            value
        );

        res.status(200).json({
            success: true,
            message: 'Service listing renewed successfully',
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};