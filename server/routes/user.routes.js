import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';


// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/coins/balance', protect, userController.getCoinBalance);
router.get('/coins/transactions', protect, userController.getCoinTransactions);
router.post('/coins/send', protect, userController.sendCoins); 

router.get('/:userId', protect, userController.getUserById);


export default router;