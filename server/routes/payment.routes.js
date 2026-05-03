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
router.get('/all', protect, admin, paymentController.adminGetAllPayments);
router.get('/detail/:id', protect, admin, paymentController.adminGetPaymentById);
router.patch('/status/:id', protect, admin, updatePaymentStatusValidator, paymentController.adminUpdatePaymentStatus);

export default router;