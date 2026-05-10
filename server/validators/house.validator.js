import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
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

//  CREATE HOUSE VALIDATOR 
export const createHouseValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be 20-5000 characters')
    .trim(),

  body('listingMode')
    .notEmpty()
    .withMessage('Listing mode is required')
    .isIn(['rent', 'sell'])
    .withMessage('Listing mode must be rent or sell'),

  body('houseType')
    .notEmpty()
    .withMessage('House type is required')
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type. Must be condominium, villa, business, apartment, or others'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  // required only when listingMode = rent
  body('rentalPeriod')
    .if(body('listingMode').equals('rent'))
    .notEmpty()
    .withMessage('Rental period is required for rent listings')
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Rental period must be daily, weekly, monthly, or yearly'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a positive integer'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a positive integer'),

  body('area_sqm')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Area must be a positive integer'),

  body('tanker')
    .optional()
    .isBoolean()
    .withMessage('Tanker must be true or false'),

  body('parking')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Parking must be a positive integer'),

  body('location.city')
    .notEmpty()
    .withMessage('City is required')
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
    .withMessage('Contact coin limit must be a positive integer'),

  body('paidUntil')
  .optional()
  .isInt({ min: 1 })
  .withMessage('paidUntil must be a positive integer representing days')
  .toInt(),
   

  handleValidationErrors,
];

//  UPDATE HOUSE VALIDATOR 
export const updateHouseValidator = [
  param('id')
    .notEmpty()
    .withMessage('House ID is required')
    .isMongoId()
    .withMessage('Invalid house ID format'),

  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be 20-5000 characters')
    .trim(),

  body('listingMode')
    .optional()
    .isIn(['rent', 'sell'])
    .withMessage('Listing mode must be rent or sell'),

  body('houseType')
    .optional()
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type. Must be condominium, villa, business, apartment, or others'),

  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Images must be an array with at least one image'),

  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a valid string URL'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('rentalPeriod')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Rental period must be daily, weekly, monthly, or yearly'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a positive integer'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a positive integer'),

  body('area_sqm')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Area must be a positive integer'),

  body('tanker')
    .optional()
    .isBoolean()
    .withMessage('Tanker must be true or false'),

  body('parking')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Parking must be a positive integer'),

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
    .withMessage('Contact coin limit must be a positive integer'),

  body('paidUntil')
    .optional()
    .isISO8601()
    .withMessage('paidUntil must be a valid date')
    .toDate()
    .custom((value) => {
      if (value && value < new Date()) {
        throw new Error('paidUntil must be a future date');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'occupied', 'sold', 'done'])
    .withMessage('Status must be active, inactive, occupied, sold, or done'),

  handleValidationErrors,
];

//  ID PARAM VALIDATOR 
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('House ID is required')
    .isMongoId()
    .withMessage('Invalid house ID format'),

  handleValidationErrors,
];

//  SEARCH QUERY VALIDATOR 
export const searchQueryValidator = [
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

  query('listingMode')
    .optional()
    .isIn(['rent', 'sell'])
    .withMessage('Listing mode must be rent or sell'),

  query('houseType')
    .optional()
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type'),

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

  query('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a positive integer')
    .toInt(),

  query('search')
    .optional()
    .trim(),

  query('status')
    .optional()
    .isIn(['active', 'inactive', 'occupied', 'sold', 'done'])
    .withMessage('Status must be active, inactive, occupied, sold, or done'),

  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
    .toFloat(),

  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
    .toFloat(),

  query('radius')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Radius must be a positive number in kilometers')
    .toFloat(),

  handleValidationErrors,
];