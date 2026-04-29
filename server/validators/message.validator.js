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

//  MARK AS READ VALIDATOR 
export const markAsReadValidator = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Invalid message ID format'),

  handleValidationErrors,
];

//  DELETE MESSAGE VALIDATOR 
export const deleteMessageValidator = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Invalid message ID format'),

  handleValidationErrors,
];