import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as serviceController from '../controllers/service.controller.js';
import { createServiceValidator, updateServiceValidator } from '../validators/service.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  USER SERVICE ROUTES 
router.post('/', protect, uploadMultiple, handleUploadError, createServiceValidator, serviceController.createService);
router.get('/my-listings', protect, serviceController.getMyServices);
router.get('/:id', protect, serviceController.getServiceById);
router.put('/:id', protect, uploadMultiple, handleUploadError, updateServiceValidator, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);
router.put('/:id/status', protect, serviceController.updateServiceStatus);

//  PUBLIC SERVICE ROUTES 
router.get('/', serviceController.getAllServices);
router.get('/search/:city', serviceController.searchServicesByCity);
router.get('/type/:serviceType', serviceController.getServicesByType);

//  ADMIN SERVICE ROUTES 
router.get('/admin/all', protect, admin, serviceController.adminGetAllServices);
router.put('/admin/:id/status', protect, admin, serviceController.adminUpdateServiceStatus);
router.delete('/admin/:id', protect, admin, serviceController.adminDeleteService);

export default router;