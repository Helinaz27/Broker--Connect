// routes/serviceRoutes.js
import express from 'express';
const router = express.Router();
import * as serviceController from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/auth.js';
import { canCreateListing } from '../middleware/canCreateListing.js';

// Public routes
router.get('/', serviceController.getAllListings);

// Protected routes - ALL SPECIFIC ROUTES MUST COME FIRST
router.post('/', protect, canCreateListing, serviceController.createListing);
router.patch('/:id/status', protect, serviceController.updateStatus);
router.post('/:id/contact', protect, serviceController.requestContact);
router.post('/:id/renew', protect, serviceController.renewListing);
router.put('/:id', protect, serviceController.updateListing);
router.delete('/:id', protect, serviceController.deleteListing);

// Parameterized route - MUST BE LAST
router.get('/:id', serviceController.getListingById);

export default router;