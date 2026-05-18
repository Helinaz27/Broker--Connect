//import the necessary functions from express-validator
import { body, validationResult } from 'express-validator';

//  This function will be used to handle validation errors for all validators

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

//  AUTH VALIDATORS 
export const registerValidator = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim(),
  
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim()
    .isLength({ min: 8, max: 15 })
    .withMessage("Phone number must be 8-15 digits")
    .custom((value) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        throw new Error("Phone number must be 8-15 digits");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  handleValidationErrors,
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  handleValidationErrors,
];

export const forgotPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  handleValidationErrors,
];

export const verifyResetOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("otp")
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),

  handleValidationErrors,
];

export const resetPasswordValidator = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),

  handleValidationErrors,
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6 })
    .withMessage("Current password must be at least 6 characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),

  handleValidationErrors,
];

//  USER PROFILE VALIDATORS 
export const updateProfileValidator = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be 2-100 characters")
    .trim(),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be 2-100 characters")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage("Phone number must be 8-15 digits")
    .custom((value) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        throw new Error("Phone number must be 8-15 digits");
      }
      return true;
    })
    .trim(),

  handleValidationErrors,
];

//  ADMIN VALIDATORS 
export const updateUserStatusValidator = [
  body("isActive")
    .notEmpty()
    .withMessage("isActive status is required")
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];