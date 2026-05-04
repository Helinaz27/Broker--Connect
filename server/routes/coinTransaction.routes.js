import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as coinTransactionController from '../controllers/coinTransaction.controller.js';
import { transactionQueryValidator, idParamValidator, userIdParamValidator } from '../validators/coinTransaction.validator.js';

const router = express.Router();

//  USER COIN TRANSACTION ROUTES 
router.get('/my-transactions', protect, transactionQueryValidator, coinTransactionController.getMyTransactions);
router.get('/my-transaction/:id', protect, idParamValidator, coinTransactionController.getMyTransactionById);

//  ADMIN COIN TRANSACTION ROUTES 
router.get('/admin/all', protect, admin, transactionQueryValidator, coinTransactionController.adminGetAllTransactions);
router.get('/admin/transaction/:id', protect, admin, idParamValidator, coinTransactionController.adminGetTransactionById);
router.get('/admin/user/:userId', protect, admin, userIdParamValidator, transactionQueryValidator, coinTransactionController.adminGetTransactionsByUser);

export default router;