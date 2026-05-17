import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg
    });
  }
  next();
};

const LISTING_TYPES = ['house', 'car', 'service'];
const LISTING_MODES = ['rent', 'sell'];
const HOUSE_TYPES = ['condominium', 'villa', 'business', 'apartment', 'others'];
const CAR_TYPES = ['electric', 'fuel'];
const CAR_CONDITIONS = ['used', 'new'];
const SERVICE_TYPES = ['electrician', 'plumber', 'catering', 'house_worker', 'other'];
const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const LISTING_STATUSES = ['active', 'inactive'];

const isHouse = (req) => req.body.listingType === 'house';
const isCar = (req) => req.body.listingType === 'car';
const isService = (req) => req.body.listingType === 'service';

export const createListingValidator = [
  body('listingType')
    .notEmpty()
    .withMessage('Listing type is required')
    .isIn(LISTING_TYPES)
    .withMessage('Listing type must be house, car, or service'),

  body('listingMode')
    .if((value, { req }) => isHouse(req) || isCar(req))
    .notEmpty()
    .withMessage('Listing mode is required for house and car listings')
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters')
    .trim(),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('location.city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),

  body('location.subCity')
    .optional()
    .trim(),

  body('location.placeName')
    .notEmpty()
    .withMessage('Place name is required')
    .trim(),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('contactCoinLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Contact coin limit must be a non-negative integer')
    .default(0),

  body('houseType')
    .if((value, { req }) => isHouse(req))
    .notEmpty()
    .withMessage('House type is required for house listings')
    .isIn(HOUSE_TYPES)
    .withMessage('Invalid house type'),

  body('bedrooms')
    .if((value, { req }) => isHouse(req))
    .notEmpty()
    .withMessage('Bedrooms count is required for house listings')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),

  body('bathrooms')
    .if((value, { req }) => isHouse(req))
    .notEmpty()
    .withMessage('Bathrooms count is required for house listings')
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),

  body('area_sqm')
    .if((value, { req }) => isHouse(req))
    .notEmpty()
    .withMessage('Area in sqm is required for house listings')
    .isInt({ min: 1 })
    .withMessage('Area must be a positive integer'),

  body('tanker')
    .if((value, { req }) => isHouse(req))
    .notEmpty()
    .withMessage('Tanker field is required for house listings')
    .isBoolean()
    .withMessage('Tanker must be a boolean'),

  body('parking')
    .if((value, { req }) => isHouse(req))
    .optional()
    .isInt({ min: 0 })
    .withMessage('Parking must be a non-negative integer'),

  body('rentalPeriod')
    .if((value, { req }) => isHouse(req) && req.body.listingMode === 'rent')
    .notEmpty()
    .withMessage('Rental period is required for house rent listings')
    .isIn(PERIODS)
    .withMessage('Invalid rental period'),

  body('carType')
    .if((value, { req }) => isCar(req))
    .notEmpty()
    .withMessage('Car type is required for car listings')
    .isIn(CAR_TYPES)
    .withMessage('Car type must be electric or fuel'),

  body('condition')
    .if((value, { req }) => isCar(req))
    .notEmpty()
    .withMessage('Condition is required for car listings')
    .isIn(CAR_CONDITIONS)
    .withMessage('Condition must be used or new'),

  body('brand')
    .if((value, { req }) => isCar(req))
    .notEmpty()
    .withMessage('Brand is required for car listings')
    .trim(),

  body('carModel')
    .if((value, { req }) => isCar(req))
    .notEmpty()
    .withMessage('Car model is required for car listings')
    .trim(),

  body('serviceType')
    .if((value, { req }) => isService(req))
    .notEmpty()
    .withMessage('Service type is required for service listings')
    .isIn(SERVICE_TYPES)
    .withMessage('Invalid service type'),

  handleValidationErrors,
];

export const updateListingValidator = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters')
    .trim(),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('listingMode')
    .optional()
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

  body('status')
    .optional()
    .isIn(LISTING_STATUSES)
    .withMessage('Status must be active or inactive'),

  body('location.city')
    .optional()
    .trim(),

  body('location.subCity')
    .optional()
    .trim(),

  body('location.placeName')
    .optional()
    .trim(),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('contactCoinLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Contact coin limit must be a non-negative integer'),

  body('houseType')
    .optional()
    .isIn(HOUSE_TYPES)
    .withMessage('Invalid house type'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),

  body('area_sqm')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Area must be a positive integer'),

  body('tanker')
    .optional()
    .isBoolean()
    .withMessage('Tanker must be a boolean'),

  body('parking')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Parking must be a non-negative integer'),

  body('rentalPeriod')
    .optional()
    .isIn(PERIODS)
    .withMessage('Invalid rental period'),

  body('carType')
    .optional()
    .isIn(CAR_TYPES)
    .withMessage('Car type must be electric or fuel'),

  body('condition')
    .optional()
    .isIn(CAR_CONDITIONS)
    .withMessage('Condition must be used or new'),

  body('brand')
    .optional()
    .trim(),

  body('carModel')
    .optional()
    .trim(),

  body('serviceType')
    .optional()
    .isIn(SERVICE_TYPES)
    .withMessage('Invalid service type'),

  handleValidationErrors,
];

export const searchQueryValidator = [
  query('listingType')
    .optional()
    .isIn(LISTING_TYPES)
    .withMessage('Listing type must be house, car, or service'),

  query('listingMode')
    .optional()
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('city')
    .optional()
    .trim(),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .toFloat(),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .toFloat(),

  query('search')
    .optional()
    .trim(),

  query('status')
    .optional()
    .isIn(['active', 'inactive', 'all'])
    .withMessage('Status must be active, inactive, or all'),

  query('houseType')
    .optional()
    .isIn(HOUSE_TYPES)
    .withMessage('Invalid house type'),

  query('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer')
    .toInt(),

  query('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer')
    .toInt(),

  query('minArea')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum area must be a non-negative integer')
    .toInt(),

  query('maxArea')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum area must be a non-negative integer')
    .toInt(),

  query('carType')
    .optional()
    .isIn(CAR_TYPES)
    .withMessage('Car type must be electric or fuel'),

  query('condition')
    .optional()
    .isIn(CAR_CONDITIONS)
    .withMessage('Condition must be used or new'),

  query('brand')
    .optional()
    .trim(),

  query('serviceType')
    .optional()
    .isIn(SERVICE_TYPES)
    .withMessage('Invalid service type'),

  query('rentalPeriod')
    .optional()
    .isIn(PERIODS)
    .withMessage('Invalid rental period'),

  handleValidationErrors,
];

export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),

  handleValidationErrors,
];