// routes/user.routes.js
import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.js';
import { 
  registerValidator, 
  loginValidator,
  updateProfileValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateUserStatusValidator 
} from '../validators/user.validator.js';

const router = express.Router();

//  AUTHENTICATION 
router.post('/register', registerValidator, userController.register);
router.post('/login', loginValidator, userController.login);
router.post('/logout', userController.logout);
router.post('/forgot-password', forgotPasswordValidator, userController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, userController.resetPassword);
router.post('/change-password', protect, changePasswordValidator, userController.changePassword);

//  USER PROFILE    
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, updateProfileValidator, userController.updateProfile);
router.delete('/profile', protect, userController.deleteAccount);

//  GET USERS 
router.get('/:userId', protect, userController.getUserById);
router.get('/username/:username', protect, userController.getUserByUsername);

//   ADMIN - USER MANAGEMENT 
router.get('/admin/all', protect, admin, userController.getAllUsers);
router.put('/admin/:userId/status', protect, admin, updateUserStatusValidator, userController.updateUserStatus);
router.delete('/admin/:userId', protect, admin, userController.deleteUserByAdmin);

export default router;