import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as coinTransactionController from '../controllers/coinTransaction.controller.js';

const router = express.Router();

//  USER COIN TRANSACTION ROUTES 
router.get('/my-transactions', protect, coinTransactionController.getMyTransactions);
router.get('/my-balance', protect, coinTransactionController.getMyBalance);

//  ADMIN COIN TRANSACTION ROUTES 
router.get('/admin/all', protect, admin, coinTransactionController.adminGetAllTransactions);
router.get('/admin/user/:userId', protect, admin, coinTransactionController.adminGetTransactionsByUser);

export default router;