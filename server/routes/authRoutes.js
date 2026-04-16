import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
//routes
router.post('/register', authController.register);
router.post('/login', authControllerController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;