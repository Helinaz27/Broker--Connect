import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as paymentController from '../controllers/payment.controller.js';
import { createPaymentValidator, updatePaymentStatusValidator } from '../validators/payment.validator.js';

const router = express.Router();

//  USER PAYMENT ROUTES 
router.post('/', protect, createPaymentValidator, paymentController.createPayment);
router.get('/my-payments', protect, paymentController.getMyPayments);
router.get('/:id', protect, paymentController.getPaymentById);

//  ADMIN PAYMENT ROUTES 
router.get('/admin/all', protect, admin, paymentController.adminGetAllPayments);
router.put('/admin/:id/status', protect, admin, updatePaymentStatusValidator, paymentController.adminUpdatePaymentStatus);
router.get('/admin/user/:userId', protect, admin, paymentController.adminGetPaymentsByUser);

export default router;