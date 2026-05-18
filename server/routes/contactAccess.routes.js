import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as contactAccessController from '../controllers/contactAccess.controller.js';
import { accessContactValidator } from '../validators/contactAccess.validator.js';

const router = express.Router();

//  USER CONTACT ACCESS ROUTES 
router.post('/access', protect, accessContactValidator, contactAccessController.accessContact);

// Get user's contact access history
router.get('/my-accesses', protect, contactAccessController.getMyAccesses)

//  ADMIN CONTACT ACCESS ROUTES 
router.get('/admin/all', protect, admin, contactAccessController.adminGetAllAccesses);

router.get('/admin/listing/:listingId', protect, admin, contactAccessController.adminGetAccessesByListing);

router.get('/admin/user/:userId', protect, admin, contactAccessController.adminGetAccessesByUser);

export default router;