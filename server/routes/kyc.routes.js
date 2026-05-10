import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as kycController from '../controllers/kyc.controller.js';
import { submitKycValidator } from '../validators/kyc.validator.js';
import { uploadKYCImages, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  USER ROUTES 
router.post('/submit', protect, uploadKYCImages, handleUploadError, submitKycValidator, kycController.submitKYC);
router.get('/my-status', protect, kycController.getMyKYCStatus);

//  ADMIN ROUTES 
router.get('/', protect, admin, kycController.getAllKYC);  
router.get('/getkyc/:requestId', protect, admin, kycController.getKYCById);
router.put('/:requestId/approve', protect, admin, kycController.approveKYC); 
router.patch('/:requestId/reject', protect, admin, kycController.rejectKYC);   

export default router;