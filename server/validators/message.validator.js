import { body, param } from 'express-validator';
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

export const sendMessageValidator = [
  param('roomId')
    .notEmpty().withMessage('Room ID is required')
    .isMongoId().withMessage('Invalid room ID format'),

  body('content')
    .notEmpty().withMessage('Message content is required')
    .isString().withMessage('Message content must be a string'),

  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file']).withMessage('Invalid message type. Must be text, image or file'),

  body('listingId')
    .notEmpty().withMessage('Listing ID is required')
    .isMongoId().withMessage('Invalid listing ID format'),

  handleValidationErrors,
];