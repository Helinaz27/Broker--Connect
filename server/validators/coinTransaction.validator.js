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

//   TRANSACTION QUERY VALIDATOR   
export const transactionQueryValidator = [
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

  query('type')
    .optional()
    .isIn(['credit', 'debit'])
    .withMessage('Type must be credit or debit'),

  query('reason')
    .optional()
    .isIn(['kyc_bonus', 'welcome_bonus', 'purchase', 'posting_fee', 'contact_access', 'user_transfer', 'refund'])
    .withMessage('Invalid transaction reason'),

  handleValidationErrors,
];

//   ID PARAM VALIDATOR  
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
  handleValidationErrors,
];

//  USER ID PARAM VALIDATOR 
export const userIdParamValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  handleValidationErrors,
];