import { body, validationResult } from 'express-validator';

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

//  CREATE SERVICE VALIDATOR 
export const createServiceValidator = [
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

  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['electrician', 'plumber', 'catering', 'house_worker', 'other'])
    .withMessage('Invalid service type'),

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
    .optional()
    .trim(),

  body('contactCoinLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Contact coin limit must be a positive integer')
    .default(0),

  handleValidationErrors,
];

//  UPDATE SERVICE VALIDATOR 
export const updateServiceValidator = [
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

  body('serviceType')
    .optional()
    .isIn(['electrician', 'plumber', 'catering', 'house_worker', 'other'])
    .withMessage('Invalid service type'),

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