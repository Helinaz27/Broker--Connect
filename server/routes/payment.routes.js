import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as paymentController from '../controllers/payment.controller.js';
import {
  createPaymentValidator,
  updatePaymentValidator,
  initiateChapaValidator,
} from '../validators/payment.validator.js';

const router = express.Router();

//  CHAPA (direct integration) 
router.post('/chapa/initiate', protect, initiateChapaValidator, initiateChapaPayment);
router.get('/chapa/callback',chapaCallback);
router.get('/chapa/verify/:tx_ref', protect, verifyChapaPayment);

//  USER 
router.post('/', protect, createPaymentValidator, createPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/check-balance', protect, getCoinBalance);

//  ADMIN 
router.get('/all-payments', protect, admin, getAllPayments);
router.get('/search-payment', protect, admin, searchPayment); 
router.patch('/update-payment/:id', protect, admin, updatePaymentValidator,updatePaymentStatus);
router.delete('/delete-payment/:id', protect, admin,deletePayment);

export default router;