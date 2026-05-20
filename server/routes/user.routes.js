import express from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/auth.js";
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  forgotPasswordValidator,
  verifyResetOtpValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateUserStatusValidator,
} from "../validators/user.validator.js";

import { can } from "../middleware/can.js";

const router = express.Router();

//  AUTHENTICATION
router.post("/register", registerValidator, userController.register);
router.post("/login", loginValidator, userController.login);
router.post("/logout", userController.logout);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  userController.forgotPassword,
);
router.post(
  "/verify-reset-otp",
  verifyResetOtpValidator,
  userController.verifyResetOtp,
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  userController.resetPassword,
);
router.post(
  "/change-password",
  protect,
  changePasswordValidator,
  userController.changePassword,
);

router.get("/profile", can("user", "readOwn"), userController.getProfile);
router.put(
  "/profile",
  can("user", "updateOwn"),
  updateProfileValidator,
  userController.updateProfile,
);

router.get("/:userId", can("user", "readOwn"), userController.getUserById);

router.get("/admin/all", can("user", "manage"), userController.getAllUsers);
router.put(
  "/admin/:userId/status",
  can("user", "manage"),
  updateUserStatusValidator,
  userController.updateUserStatus,
);
router.delete(
  "/admin/:userId",
  can("user", "manage"),
  userController.deleteUserByAdmin,
);

export default router;
