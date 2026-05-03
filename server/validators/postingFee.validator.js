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

//  CREATE POSTING FEE VALIDATOR 
export const createPostingFeeValidator = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['house', 'car', 'service'])
    .withMessage('Category must be house, car, or service'),

  body('durationDays')
    .notEmpty()
    .withMessage('Duration days is required')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration days must be between 1 and 365'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  handleValidationErrors,
];

//  UPDATE POSTING FEE VALIDATOR 
export const updatePostingFeeValidator = [
  body('category')
    .optional()
    .isIn(['house', 'car', 'service'])
    .withMessage('Category must be house, car, or service'),

  body('durationDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration days must be between 1 and 365'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  handleValidationErrors,
];

//  GET POSTING FEES FILTER VALIDATOR 
export const getPostingFeesValidator = [
  query('id')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID format'),

  query('category')
    .optional()
    .isIn(['house', 'car', 'service'])
    .withMessage('Category must be house, car, or service'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false'),

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

  handleValidationErrors,
];

//  ID PARAM VALIDATOR 
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Posting fee ID is required')
    .isMongoId()
    .withMessage('Invalid posting fee ID format'),
  handleValidationErrors,
];