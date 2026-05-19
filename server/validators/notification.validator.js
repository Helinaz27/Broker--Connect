import { body, param, validationResult } from 'express-validator';

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

export const sendNotificationValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters')
    .trim(),

  body('body')
    .notEmpty().withMessage('Body is required')
    .isLength({ min: 3, max: 1000 }).withMessage('Body must be 3–1000 characters')
    .trim(),

  body('userId')
    .optional()
    .isMongoId().withMessage('Invalid user ID format'),

  body('path')
    .optional()
    .trim(),

  body('referenceId')
    .optional()
    .isMongoId().withMessage('Invalid reference ID format'),

  handleValidationErrors,
];

export const markAsReadValidator = [
  param('id')
    .notEmpty().withMessage('Notification ID is required')
    .isMongoId().withMessage('Invalid notification ID format'),

  handleValidationErrors,
];