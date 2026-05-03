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

//  CREATE PAYMENT VALIDATOR 
export const createPaymentValidator = [
  body('amountBirr')
    .notEmpty()
    .withMessage('Amount in Birr is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 Birr'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['telebirr', 'bank', 'card', 'other'])
    .withMessage('Payment method must be telebirr, bank, card, or other'),

  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .trim(),

  handleValidationErrors,
];

//  UPDATE PAYMENT STATUS VALIDATOR 
export const updatePaymentStatusValidator = [
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'success', 'failed'])
    .withMessage('Status must be pending, success, or failed'),

  handleValidationErrors,
];

//  GET PAYMENTS QUERY VALIDATOR 
export const getPaymentsQueryValidator = [
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

  query('status')
    .optional()
    .isIn(['pending', 'success', 'failed', 'all'])
    .withMessage('Status must be pending, success, failed, or all'),

  handleValidationErrors,
];

//  ID PARAM VALIDATOR 
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format'),
  handleValidationErrors,
];