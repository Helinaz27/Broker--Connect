import Joi from 'joi';
import { COIN_RULES } from '../utils/constants.js';

export const createCarListingValidation = Joi.object({
    title: Joi.string().required().min(5).max(100).messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 100 characters'
    }),
    description: Joi.string().required().min(20).max(1000).messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 20 characters',
        'string.max': 'Description cannot exceed 1000 characters'
    }),
    carType: Joi.string().valid('sedan', 'suv', 'hatchback', 'truck', 'bus', 'others').required().messages({
        'any.only': 'Car type must be one of: sedan, suv, hatchback, truck, bus, others',
        'any.required': 'Car type is required'
    }),
    brand: Joi.string().required().messages({
        'string.empty': 'Brand is required'
    }),
    model: Joi.string().required().messages({
        'string.empty': 'Model is required'
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
        'number.min': 'Year must be at least 1900',
        'number.max': `Year cannot exceed ${new Date().getFullYear() + 1}`,
        'any.required': 'Year is required'
    }),
    images: Joi.array().items(Joi.string().uri()).max(COIN_RULES.MAX_IMAGES_PER_LISTING).min(1).required().messages({
        'array.min': 'At least one image is required',
        'array.max': `Maximum ${COIN_RULES.MAX_IMAGES_PER_LISTING} images allowed`,
        'any.required': 'Images are required'
    }),
    rentPrice: Joi.number().positive().required().messages({
        'number.positive': 'Rent price must be a positive number',
        'any.required': 'Rent price is required'
    }),
    listing_type: Joi.string().valid('sale', 'rent').required().messages({
        'any.only': 'Listing type must be either sale or rent',
        'any.required': 'Listing type is required'
    }),
    location: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        subCity: Joi.string(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        pincode: Joi.string().required(),
        coordinates: Joi.array().items(Joi.number()).length(2)
    }).required(),
    contactCoinLimit: Joi.number().min(0).required().messages({
        'number.min': 'Contact coin limit cannot be negative',
        'any.required': 'Contact coin limit is required'
    }),

    paidUntil: Joi.date().greater('now').required().messages({
        'date.greater': 'Paid until date must be in the future',
        'any.required': 'Paid until date is required'
    }),
    mileage: Joi.number().min(0).required(),
    fuel_type: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
    transmission: Joi.string().valid('manual', 'automatic').required(),
    seats: Joi.number().min(1).max(100).required(),
    color: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive', 'sold', 'rented').default('active')
});

export const updateCarListingValidation = Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(20).max(1000),
    carType: Joi.string().valid('sedan', 'suv', 'hatchback', 'truck', 'bus', 'others'),
    brand: Joi.string(),
    model: Joi.string(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    images: Joi.array().items(Joi.string().uri()).max(COIN_RULES.MAX_IMAGES_PER_LISTING).min(1),
    rentPrice: Joi.number().positive(),
    listing_type: Joi.string().valid('sale', 'rent'),
    location: Joi.object({
        address: Joi.string(),
        city: Joi.string(),
        subCity: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        pincode: Joi.string(),
        coordinates: Joi.array().items(Joi.number()).length(2)
    }),
    contactCoinLimit: Joi.number().min(0),
    mileage: Joi.number().min(0),
    fuel_type: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid'),
    transmission: Joi.string().valid('manual', 'automatic'),
    seats: Joi.number().min(1).max(100),
    color: Joi.string(),
    status: Joi.string().valid('active', 'inactive', 'sold', 'rented')
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export const statusUpdateValidation = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'sold', 'rented').required().messages({
        'any.only': 'Status must be one of: active, inactive, sold, rented',
        'any.required': 'Status is required'
    })
});

export const renewListingValidation = Joi.object({
    paidUntil: Joi.date().greater('now').required().messages({
        'date.greater': 'Paid until date must be in the future',
        'any.required': 'Paid until date is required'
    })
});