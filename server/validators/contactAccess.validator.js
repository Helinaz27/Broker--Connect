import { body } from 'express-validator';
import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

export const accessContactValidator = [
  body('listingId')
    .notEmpty().withMessage('Listing ID is required')
    .isMongoId().withMessage('Invalid listing ID format'),
  handleValidationErrors,
];