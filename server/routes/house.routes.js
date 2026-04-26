// routes/houseRoutes.js
import express from 'express';
const router = express.Router();
import * as houseController from '../controllers/houseController.js';
import { protect, admin } from '../middleware/auth.js';
import { canCreateListing } from '../middleware/canCreateListing.js';

// Public routes
router.get('/', houseController.getAllListings);

// ALL specific routes MUST come BEFORE the parameterized route
router.post('/', protect, canCreateListing, houseController.createListing);
router.post('/:id/contact', protect, houseController.requestContact);
router.post('/:id/renew', protect, houseController.renewListing);
router.patch('/:id/status', protect, houseController.updateStatus);
router.put('/:id', protect, houseController.updateListing);
router.delete('/:id', protect, houseController.deleteListing);

// Parameterized route - MUST BE LAST
router.get('/:id', houseController.getListingById);

export default router;