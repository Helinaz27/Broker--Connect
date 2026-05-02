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

//  CREATE CAR VALIDATOR 
export const createCarValidator = [
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

  body('carType')
    .notEmpty()
    .withMessage('Car type is required')
    .isIn(['sedan', 'suv', 'hatchback', 'truck', 'bus', 'others'])
    .withMessage('Invalid car type'),

  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .trim(),

  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .trim(),

  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),

  body('rentPrice')
    .notEmpty()
    .withMessage('Rent price is required')
    .isFloat({ min: 0 })
    .withMessage('Rent price must be a positive number'),

  body('durationDays')
    .notEmpty()
    .withMessage('Duration days is required')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration days must be between 1 and 365'),

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

  body('contactCoinLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Contact coin limit must be a positive integer')
    .default(0),

  handleValidationErrors,
];

//  UPDATE CAR VALIDATOR 
export const updateCarValidator = [
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

  body('carType')
    .optional()
    .isIn(['sedan', 'suv', 'hatchback', 'truck', 'bus', 'others'])
    .withMessage('Invalid car type'),

  body('brand')
    .optional()
    .trim(),

  body('model')
    .optional()
    .trim(),

  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),

  body('rentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rent price must be a positive number'),

  body('location.city')
    .optional()
    .trim(),

  body('location.subCity')
    .optional()
    .trim(),

  body('location.placeName')
    .optional()
    .trim(),

  body('contactCoinLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Contact coin limit must be a positive integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

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

  query('carType')
    .optional()
    .isIn(['sedan', 'suv', 'hatchback', 'truck', 'bus', 'others'])
    .withMessage('Invalid car type'),

  query('brand')
    .optional()
    .trim(),

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

  handleValidationErrors,
];

//  ID PARAM VALIDATOR 
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Car ID is required')
    .isMongoId()
    .withMessage('Invalid car ID format'),
  handleValidationErrors,
];