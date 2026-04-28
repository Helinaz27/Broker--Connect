// validators/kyc.validator.js
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

export const submitKycValidator = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['national_id', 'passport'])
    .withMessage('Document type must be national_id or passport'),

  body('documentNumber')
    .notEmpty()
    .withMessage('Document number is required')
    .trim(),

  body('documentImageUrl')
    .notEmpty()
    .withMessage('Document image URL is required')
    .isURL()
    .withMessage('Valid image URL is required'),

  handleValidationErrors,
];