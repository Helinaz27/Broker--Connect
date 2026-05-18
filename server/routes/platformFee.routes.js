import express from 'express';
import * as platformFeeController from '../controllers/platformFee.controller.js';
import {
  createPlatformFeeValidator,
  updatePlatformFeeValidator,
  searchPlatformFeesValidator,
  idParamValidator,
} from '../validators/platformFee.validator.js';
import { can } from '../middleware/can.js';

const router = express.Router();

router.post('/create',can('platformFee', 'manage'), createPlatformFeeValidator, platformFeeController.createPlatformFeeCtrl);
router.get('/get-all', can('platformFee', 'manage'), searchPlatformFeesValidator, platformFeeController.getAllPlatformFeesCtrl);
router.get('/search',can('platformFee', 'manage'), searchPlatformFeesValidator, platformFeeController.searchPlatformFeesCtrl);
router.get('/:id', can('platformFee', 'manage'), idParamValidator, platformFeeController.getPlatformFeeByIdCtrl);
router.put('/:id/update', can('platformFee', 'manage'), updatePlatformFeeValidator, platformFeeController.updatePlatformFeeCtrl);
router.delete('/:id/delete', can('platformFee', 'manage'), idParamValidator, platformFeeController.deletePlatformFeeCtrl);

export default router;