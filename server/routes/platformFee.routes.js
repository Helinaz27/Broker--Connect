import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as platformFeeController from '../controllers/platformFee.controller.js';
import {
  createPlatformFeeValidator,
  updatePlatformFeeValidator,
  searchPlatformFeesValidator,
  idParamValidator,
} from '../validators/platformFee.validator.js';

const router = express.Router();

router.post('/create', protect, admin, createPlatformFeeValidator, platformFeeController.createPlatformFeeCtrl);
router.get('/get-all', protect, admin, searchPlatformFeesValidator, platformFeeController.getAllPlatformFeesCtrl);
router.get('/search', protect, admin, searchPlatformFeesValidator, platformFeeController.searchPlatformFeesCtrl);
router.get('/:id', protect, admin, idParamValidator, platformFeeController.getPlatformFeeByIdCtrl);
router.put('/:id/update', protect, admin, updatePlatformFeeValidator, platformFeeController.updatePlatformFeeCtrl);
router.delete('/:id/delete', protect, admin, idParamValidator, platformFeeController.deletePlatformFeeCtrl);

export default router;