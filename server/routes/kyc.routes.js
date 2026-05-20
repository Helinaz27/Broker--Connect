import express from 'express';
import { can } from '../middleware/can.js';
import * as kycController from '../controllers/kyc.controller.js';
import { submitKycValidator } from '../validators/kyc.validator.js';
import { uploadKYCImages, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.post('/submit',              can('kyc', 'createOwn'),  uploadKYCImages, handleUploadError, submitKycValidator, kycController.submitKYC);
router.get('/my-status',            can('kyc', 'readOwn'),    kycController.getMyKYCStatus);

router.get('/get-all',              can('kyc', 'manage'),     kycController.getAllKYC);
router.get('/:requestId/getkyc',    can('kyc', 'manage'),     kycController.getKYCById);
router.put('/:requestId/approve',   can('kyc', 'manage'),     kycController.approveKYC);
router.patch('/:requestId/reject',  can('kyc', 'manage'),     kycController.rejectKYC);

export default router;