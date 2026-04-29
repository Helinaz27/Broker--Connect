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