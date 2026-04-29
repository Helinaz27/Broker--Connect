import { body, param, validationResult } from 'express-validator';

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

//  SEND NOTIFICATION VALIDATOR 
export const sendNotificationValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be 3-200 characters')
    .trim(),

  body('body')
    .notEmpty()
    .withMessage('Body is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Body must be 3-1000 characters')
    .trim(),

  body('Type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn(['message', 'payment_success', 'kyc_approved', 'kyc_rejected', 'post_expired', 'insufficient_coins', 'new_contact', 'system'])
    .withMessage('Invalid notification type'),

  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),

  body('data.path')
    .optional()
    .trim(),

  body('data.referenceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid reference ID format'),

  handleValidationErrors,
];

//  MARK AS READ VALIDATOR 
export const markAsReadValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Invalid notification ID format'),

  handleValidationErrors,
];

//  DELETE NOTIFICATION VALIDATOR 
export const deleteNotificationValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Invalid notification ID format'),

  handleValidationErrors,
];