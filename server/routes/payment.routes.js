import express from 'express';
import { can } from '../middleware/can.js';
import * as paymentController from '../controllers/payment.controller.js';
import {
  updatePaymentValidator,
  initiateChapaValidator,
} from '../validators/payment.validator.js';

const router = express.Router();

router.post('/initiate', can('payment', 'createOwn'), initiateChapaValidator, paymentController.initiateChapa);
router.get('/verify/:tx_ref', can('payment', 'readOwn'), paymentController.verifyChapa);
router.post('/webhook', paymentController.chapaWebhook);

router.get('/my-payments', can('payment', 'readOwn'), paymentController.getMyPayments);
router.get('/check-balance', can('payment', 'readOwn'), paymentController.getCoinBalance);

router.get('/admin/all', can('payment', 'manage'), paymentController.getAllPayments);
router.get('/admin/search', can('payment', 'manage'), paymentController.searchPayment);
router.patch('/admin/update/:id', can('payment', 'manage'), updatePaymentValidator, paymentController.updatePaymentStatus);
router.delete('/admin/delete/:id', can('payment', 'manage'), paymentController.deletePayment);

export default router;