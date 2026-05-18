import { body, param, query } from 'express-validator';
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

export const initiateChapaValidator = [
  body('coinsRequested')
    .notEmpty().withMessage('Coins amount is required')
    .isInt({ min: 1 }).withMessage('Coins must be a positive integer'),
  handleValidationErrors,
];

export const updatePaymentValidator = [
  param('id')
    .notEmpty().withMessage('Payment ID is required')
    .isMongoId().withMessage('Invalid payment ID format'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'success', 'failed']).withMessage('Invalid payment status'),
  handleValidationErrors,
];