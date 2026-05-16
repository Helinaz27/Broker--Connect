import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as listingController from '../controllers/listing.controller.js';
import { createListingValidator, updateListingValidator } from '../validators/listing.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { can } from '../middleware/can.js';

const router = express.Router();

router.post('/create', can('listing', 'createOwn'), uploadMultiple, handleUploadError, createListingValidator, listingController.createListingCtrl);

router.put('/:id/update', can('listing', 'updateOwn'), uploadMultiple, handleUploadError, updateListingValidator, listingController.updateListingCtrl);
router.put('/:id/status', can('listing', 'updateOwn'), listingController.updateListingStatusCtrl);

router.get('/get-all', listingController.getAllListingsCtrl);
router.get('/get-my-listings', can('listing', 'readOwn'), listingController.getMyListingsCtrl);
router.get('/admin/all', can('listing', 'manage'), admin, listingController.adminGetAllListingsCtrl);
router.get('/search', listingController.searchListingsCtrl);
router.get('/dashboard/search', can('listing', 'readOwn'), listingController.searchUserListingsCtrl);
router.get('/admin/search', can('listing', 'manage'), protect, admin, listingController.searchAdminListingsCtrl);

router.get('/:id/single-listing', listingController.getListingByIdCtrl);

export default router;