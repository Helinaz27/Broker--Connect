import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as postingFeeController from '../controllers/postingFee.controller.js';
import { createPostingFeeValidator, updatePostingFeeValidator } from '../validators/postingFee.validator.js';

const router = express.Router();

//  ADMIN ONLY 
router.post('/', protect, admin, createPostingFeeValidator, postingFeeController.createPostingFee);
router.get('/', protect, admin, postingFeeController.getAllPostingFees);
router.put('/:id', protect, admin, updatePostingFeeValidator, postingFeeController.updatePostingFee);

// Get posting fees with filters (by id, category, isActive, etc.)
router.get('/filter', protect, admin, postingFeeController.getPostingFees);
router.get('/:id', protect, admin, postingFeeController.getPostingFeeById);


export default router;