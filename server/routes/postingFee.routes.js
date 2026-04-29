import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as postingFeeController from '../controllers/postingFee.controller.js';
import { createPostingFeeValidator, updatePostingFeeValidator } from '../validators/postingFee.validator.js';

const router = express.Router();

//  ADMIN POSTING FEE ROUTES (Only Admin) 
router.post('/', protect, admin, createPostingFeeValidator, postingFeeController.createPostingFee);
router.get('/', protect, admin, postingFeeController.getAllPostingFees);
router.get('/:id', protect, admin, postingFeeController.getPostingFeeById);
router.put('/:id', protect, admin, updatePostingFeeValidator, postingFeeController.updatePostingFee);
router.delete('/:id', protect, admin, postingFeeController.deletePostingFee);

//  PUBLIC ROUTES (View active fees) 
router.get('/public/active', postingFeeController.getActivePostingFees);
router.get('/public/category/:category', postingFeeController.getPostingFeesByCategory);

export default router;