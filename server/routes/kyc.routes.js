import express from 'express';
import {
  submitKycRequest,
  getMyKycRequests,
  getAllKycRequests,
  getKycRequestById,
  reviewKycRequest,
  deleteKycRequest
} from '../controllers/kycController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitKycRequest);
router.get('/my-requests', protect, getMyKycRequests);
router.get('/', protect, admin, getAllKycRequests);
router.get('/:id', protect, admin, getKycRequestById);
router.put('/:id/review', protect, admin, reviewKycRequest);
router.delete('/:id', protect, admin, deleteKycRequest);

export default router;