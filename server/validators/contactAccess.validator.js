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

//  ACCESS CONTACT VALIDATOR 
export const accessContactValidator = [
  body('listingId')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),

  body('listingType')
    .notEmpty()
    .withMessage('Listing type is required')
    .isIn(['house', 'car', 'service'])
    .withMessage('Listing type must be house, car, or service'),

  body('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isMongoId()
    .withMessage('Invalid owner ID format'),

  handleValidationErrors,
];