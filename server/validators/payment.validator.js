import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const initiateChapaValidator = [
  body('coinsRequested')
    .notEmpty().withMessage('Coins amount is required')
    .isInt({ min: 1 }).withMessage('Coins must be a positive integer'),
  validate,
];

export const updatePaymentValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'success', 'failed']).withMessage('Invalid payment status'),
  validate,
];