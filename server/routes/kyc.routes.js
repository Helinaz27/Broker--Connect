import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as kycController from '../controllers/kyc.controller.js';
import { submitKycValidator } from '../validators/kyc.validator.js';
import { uploadKYCImages, handleUploadError } from '../middleware/upload.js'; 

const router = express.Router();

//  USER KYC ROUTES 
router.post('/submit', protect, uploadKYCImages, handleUploadError, submitKycValidator, kycController.submitKYC);  
router.get('/my-status', protect, kycController.getMyKYCStatus);

//  ADMIN KYC ROUTES 
router.get('/pending', protect, admin, kycController.getPendingKYC);
router.get('/approved', protect, admin, kycController.getApprovedKYC);  
router.get('/rejected', protect, admin, kycController.getRejectedKYC);  
router.get('/all', protect, admin, kycController.getAllKYC);
router.get('/:requestId', protect, admin, kycController.getKYCById);
router.put('/:requestId/approve', protect, admin, kycController.approveKYC);
router.put('/:requestId/reject', protect, admin, kycController.rejectKYC);

export default router;