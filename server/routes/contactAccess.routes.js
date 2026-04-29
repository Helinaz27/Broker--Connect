import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as contactAccessController from '../controllers/contactAccess.controller.js';
import { accessContactValidator } from '../validators/contactAccess.validator.js';

const router = express.Router();

//  USER CONTACT ACCESS ROUTES 
router.post('/access', protect, accessContactValidator, contactAccessController.accessContact);
router.get('/my-accesses', protect, contactAccessController.getMyAccesses);
router.get('/check/:listingId', protect, contactAccessController.checkAccess);

//  ADMIN CONTACT ACCESS ROUTES 
router.get('/admin/all', protect, admin, contactAccessController.adminGetAllAccesses);
router.get('/admin/listing/:listingId', protect, admin, contactAccessController.adminGetAccessesByListing);

export default router;