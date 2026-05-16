import { setTokenCookie, clearTokenCookie } from "../utils/tokenGenerator.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  forgotPasswordUserService,
  verifyResetOtpUserService,
  resetPasswordUserService,
  changePasswordUserService,
  getProfileUserService,
  updateProfileUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserStatusService,
  deleteUserByAdminService,
} from "../services/user.service.js";

export const register = async (req, res) => {
  const result = await registerUserService(req.body);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUserService(email, password);
  if (result.success && result.data?.token) {
    setTokenCookie(res, result.data.token);
  }
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const logout = async (req, res) => {
  const result = await logoutUserService();
  clearTokenCookie(res);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await forgotPasswordUserService(email);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    ...(result.data && { data: result.data }),
  });
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyResetOtpUserService(email, otp);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await resetPasswordUserService(token, newPassword);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
  });
};

export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  const result = await changePasswordUserService(
    userId,
    currentPassword,
    newPassword,
  );
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
  });
};

export const getProfile = async (req, res) => {
  const result = await getProfileUserService(req.user.id);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, phone, profileImage } = req.body;
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (profileImage !== undefined) updateData.profileImage = profileImage;

  const result = await updateProfileUserService(userId, updateData);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;
  const result = await updateUserStatusService(userId, isActive);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const result = await getUserByIdService(userId, req.user.id, req.user.roles);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const result = await getAllUsersService(page, limit, search, role, isActive);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

export const deleteUserByAdmin = async (req, res) => {
  const { userId } = req.params;
  const result = await deleteUserByAdminService(userId);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
  });
};
