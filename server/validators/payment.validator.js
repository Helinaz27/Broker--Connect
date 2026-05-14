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

export const initiateChapaPaymentValidator = [
  body('amountBirr')
    .notEmpty().withMessage('Amount in Birr is required')
    .isFloat({ min: 10 }).withMessage('Amount must be at least 10 Birr'),
  handleValidationErrors,
];
export const updatePaymentValidator = [
  param('id')
    .notEmpty().withMessage('Payment ID is required')
    .isMongoId().withMessage('Invalid payment ID format'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'success', 'failed']).withMessage('Status must be pending, success, or failed'),
  handleValidationErrors,
];

// Validate tx_ref from Chapa callback
export const chapaCallbackValidator = [
  query('trx_ref')
    .optional(),
  query('status')
    .optional(),
  handleValidationErrors,
];