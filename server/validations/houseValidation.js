import Joi from 'joi';
import { COIN_RULES } from '../utils/constants.js';

export const createHouseListingValidation = Joi.object({
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
  houseType: Joi.string().valid('condominium', 'villa', 'business', 'apartment', 'others').required().messages({
    'any.only': 'House type must be one of: condominium, villa, business, apartment, others',
    'any.required': 'House type is required'
  }),
  images: Joi.array().items(Joi.string().uri()).max(COIN_RULES.MAX_IMAGES_PER_LISTING).min(1).required().messages({
    'array.min': 'At least one image is required',
    'array.max': `Maximum ${COIN_RULES.MAX_IMAGES_PER_LISTING} images allowed`,
    'any.required': 'Images are required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  location: Joi.object({
    city: Joi.string().required().messages({
      'string.empty': 'City is required'
    }),
    subCity: Joi.string().required().messages({
      'string.empty': 'Sub city is required'
    }),
    placeName: Joi.string().required().messages({
      'string.empty': 'Place name is required'
    }),
    coordinates: Joi.object({
      lat: Joi.number().required().messages({
        'number.base': 'Latitude must be a number',
        'any.required': 'Latitude is required'
      }),
      lng: Joi.number().required().messages({
        'number.base': 'Longitude must be a number',
        'any.required': 'Longitude is required'
      })
    }).required().messages({
      'any.required': 'Coordinates are required'
    })
  }).required().messages({
    'any.required': 'Location information is required'
  }),
  contactCoinLimit: Joi.number().min(0).required().messages({
    'number.min': 'Contact coin limit cannot be negative',
    'any.required': 'Contact coin limit is required'
  }),
  paidUntil: Joi.date().greater('now').required().messages({
    'date.greater': 'Paid until date must be in the future',
    'any.required': 'Paid until date is required'
  }),
  status: Joi.string().valid('active', 'inactive', 'occupied').default('active')
});

export const updateHouseListingValidation = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(20).max(1000),
  houseType: Joi.string().valid('condominium', 'villa', 'business', 'apartment', 'others'),
  images: Joi.array().items(Joi.string().uri()).max(COIN_RULES.MAX_IMAGES_PER_LISTING).min(1),
  price: Joi.number().positive(),
  location: Joi.object({
    city: Joi.string(),
    subCity: Joi.string(),
    placeName: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }),
  contactCoinLimit: Joi.number().min(0),
  status: Joi.string().valid('active', 'inactive', 'occupied')
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const statusUpdateValidation = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'occupied').required().messages({
    'any.only': 'Status must be one of: active, inactive, occupied',
    'any.required': 'Status is required'
  })
});

export const renewListingValidation = Joi.object({
  paidUntil: Joi.date().greater('now').required().messages({
    'date.greater': 'Paid until date must be in the future',
    'any.required': 'Paid until date is required'
  })
});