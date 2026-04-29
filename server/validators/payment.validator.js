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
    .isIn(['telebirr'])
    .withMessage('Payment method must be telebirr'),

  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .trim(),

  handleValidationErrors,
];

//  UPDATE PAYMENT STATUS VALIDATOR 
export const updatePaymentStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'success', 'failed'])
    .withMessage('Status must be pending, success, or failed'),

  handleValidationErrors,
];