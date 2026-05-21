import { body, param, query, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
    });
  }
  next();
};

export const initiateChatValidator = [
  body("listingId")
    .notEmpty()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("Invalid listingId"),
  body("otherUserId")
    .notEmpty()
    .withMessage("otherUserId is required")
    .isMongoId()
    .withMessage("Invalid otherUserId"),
  handleValidationErrors,
];

export const getRoomsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  handleValidationErrors,
];

export const searchContactsValidator = [
  query("q")
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be 1-100 characters"),
  handleValidationErrors,
];

export const getMessagesValidator = [
  param("roomId").isMongoId().withMessage("Invalid roomId"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("cursor").optional().isMongoId().withMessage("Invalid cursor"),
  handleValidationErrors,
];

export const uploadFileValidator = [
  param("roomId").isMongoId().withMessage("Invalid roomId"),
  handleValidationErrors,
];
