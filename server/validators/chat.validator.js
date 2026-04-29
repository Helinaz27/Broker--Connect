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

//  CREATE CHAT VALIDATOR 
export const createChatValidator = [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .isMongoId()
    .withMessage('Invalid participant ID format'),

  body('listingId')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),

  body('listingType')
    .notEmpty()
    .withMessage('Listing type is required')
    .isIn(['house', 'car', 'service'])
    .withMessage('Listing type must be house, car, or service'),

  handleValidationErrors,
];

//  SEND MESSAGE VALIDATOR 
export const sendMessageValidator = [
  param('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format'),

  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be 1-5000 characters')
    .trim(),

  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file'),

  handleValidationErrors,
];

//  MARK MESSAGE AS READ VALIDATOR 
export const markMessageReadValidator = [
  param('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format'),

  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Invalid message ID format'),

  handleValidationErrors,
];