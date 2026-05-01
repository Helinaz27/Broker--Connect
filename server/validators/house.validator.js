import { body, param, validationResult } from 'express-validator';

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

  body('houseType')
    .notEmpty()
    .withMessage('House type is required')
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

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

//  UPDATE HOUSE VALIDATOR 
export const updateHouseValidator = [
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

  body('houseType')
    .optional()
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

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
    .withMessage('Invalid status'),

  handleValidationErrors,
];

//  PARAM VALIDATORS 
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('House ID is required')
    .isMongoId()
    .withMessage('Invalid house ID format'),
  handleValidationErrors,
];

export const ownerIdParamValidator = [
  param('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isMongoId()
    .withMessage('Invalid owner ID format'),
  handleValidationErrors,
];

export const typeParamValidator = [
  param('houseType')
    .notEmpty()
    .withMessage('House type is required')
    .isIn(['condominium', 'villa', 'business', 'apartment', 'others'])
    .withMessage('Invalid house type'),
  handleValidationErrors,
];

export const cityParamValidator = [
  param('city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  handleValidationErrors,
];

export const priceParamValidator = [
  param('min')
    .notEmpty()
    .withMessage('Minimum price is required')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  param('max')
    .notEmpty()
    .withMessage('Maximum price is required')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  handleValidationErrors,
];