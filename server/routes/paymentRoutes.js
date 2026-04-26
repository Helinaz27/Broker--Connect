import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js'; 

// User routes - only authenticated users
router.post('/buycoin', protect, paymentController.initiatePayment);
router.get('/history', protect, paymentController.getPaymentHistory);
router.get('/methods', protect, paymentController.getPaymentMethods);

// Webhook (public)
router.post('/webhook/telebirr', paymentController.telebirrWebhook);


export default router;