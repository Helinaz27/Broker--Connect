import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController.js';
import * as paymentController from '../controllers/paymentController.js'; 
import { protect, admin } from '../middleware/auth.js';

// Existing admin routes
router.get('/dashboard', protect, admin, adminController.getDashboardStats);
router.get('/kyc/pending', protect, admin, adminController.getPendingKYC);
router.put('/kyc/:requestId/approve', protect, admin, adminController.approveKYC);
router.put('/kyc/:requestId/reject', protect, admin, adminController.rejectKYC);
router.get('/users', protect, admin, adminController.getAllUsers);
router.put('/users/:userId/status', protect, admin, adminController.updateUserStatus);
router.post('/posting-fees', protect, admin, adminController.createPostingFee);
router.get('/posting-fees', protect, admin, adminController.getPostingFees);
router.put('/posting-fees/:id', protect, admin, adminController.updatePostingFee);
router.delete('/posting-fees/:id', protect, admin, adminController.deletePostingFee);
// router.get('/system/overview', protect, admin, adminController.getSystemOverview);router.get('/payments', protect, admin, paymentController.getAllPayments);     payments
// router.get('/payments/pending', protect, admin, adminController.getPendingPayments);
// router.post('/payments/verify', protect, admin, adminController.adminVerifyPayment);

export default router;