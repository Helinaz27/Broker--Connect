import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
    });
  }
  next();
};

const FEE_TYPES = ['posting_fee', 'contact_access_fee'];
const LISTING_CATEGORIES = ['house', 'car', 'service'];
const LISTING_MODES = ['rent', 'sell'];

const isPostingFee = (req) => req.body.feeType === 'posting_fee';
const isContactAccessFee = (req) => req.body.feeType === 'contact_access_fee';

export const createPlatformFeeValidator = [
  body('feeType')
    .notEmpty()
    .withMessage('Fee type is required')
    .isIn(FEE_TYPES)
    .withMessage('Fee type must be posting_fee or contact_access_fee'),

  body('category')
    .if((value, { req }) => isPostingFee(req) || isContactAccessFee(req))
    .notEmpty()
    .withMessage('Category is required')
    .isIn(LISTING_CATEGORIES)
    .withMessage('Category must be house, car, or service'),

  body('listingMode')
    .if((value, { req }) => {
      const cat = req.body.category;
      return (isPostingFee(req) || isContactAccessFee(req)) && (cat === 'house' || cat === 'car');
    })
    .notEmpty()
    .withMessage('Listing mode is required for house and car fees')
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

  body('durationDays')
    .if((value, { req }) => isPostingFee(req))
    .notEmpty()
    .withMessage('Duration days is required for posting fees')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration days must be between 1 and 365'),

  body('coinAmount')
    .notEmpty()
    .withMessage('Coin amount is required')
    .isInt({ min: 0 })
    .withMessage('Coin amount must be a non-negative integer'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  handleValidationErrors,
];

export const updatePlatformFeeValidator = [
  param('id')
    .notEmpty()
    .withMessage('Platform fee ID is required')
    .isMongoId()
    .withMessage('Invalid platform fee ID format'),

  body('category')
    .optional()
    .isIn(LISTING_CATEGORIES)
    .withMessage('Category must be house, car, or service'),

  body('listingMode')
    .optional()
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

  body('durationDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration days must be between 1 and 365'),

  body('coinAmount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Coin amount must be a non-negative integer'),

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

export const searchPlatformFeesValidator = [
  query('feeType')
    .optional()
    .isIn(FEE_TYPES)
    .withMessage('Fee type must be posting_fee or contact_access_fee'),

  query('category')
    .optional()
    .isIn(LISTING_CATEGORIES)
    .withMessage('Category must be house, car, or service'),

  query('listingMode')
    .optional()
    .isIn(LISTING_MODES)
    .withMessage('Listing mode must be rent or sell'),

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

export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Platform fee ID is required')
    .isMongoId()
    .withMessage('Invalid platform fee ID format'),

  handleValidationErrors,
];