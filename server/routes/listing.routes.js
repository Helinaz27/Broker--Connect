import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as listingController from '../controllers/listing.controller.js';
import { createListingValidator, updateListingValidator } from '../validators/listing.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.post('/create', protect, uploadMultiple, handleUploadError, createListingValidator, listingController.createListingCtrl);

router.put('/:id/update', protect, uploadMultiple, handleUploadError, updateListingValidator, listingController.updateListingCtrl);
router.put('/:id/status', protect, listingController.updateListingStatusCtrl);

router.get('/get-all', listingController.getAllListingsCtrl);
router.get('/get-my-listings', protect, listingController.getMyListingsCtrl);
router.get('/admin/all', protect, admin, listingController.adminGetAllListingsCtrl);
router.get('/search', listingController.searchListingsCtrl);
router.get('/dashboard/search', protect, listingController.searchUserListingsCtrl);
router.get('/admin/search', protect, admin, listingController.searchAdminListingsCtrl);

router.get('/:id/single-listing', listingController.getListingByIdCtrl);

export default router;