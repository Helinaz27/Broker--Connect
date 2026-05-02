import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as serviceController from '../controllers/service.controller.js';
import { createServiceValidator, updateServiceValidator } from '../validators/service.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//   CREATE 
router.post('/', protect, uploadMultiple, handleUploadError, createServiceValidator, serviceController.createService);

//   UPDATE  
router.put('/:id', protect, uploadMultiple, handleUploadError, updateServiceValidator, serviceController.updateService);
router.patch('/:id/status', protect, serviceController.updateServiceStatus);

//   GET    
router.get('/', serviceController.getAllServices);                      
router.get('/my', protect, serviceController.getMyServices);            
router.get('/admin/all', protect, admin, serviceController.adminGetAllServices); 

//  search
router.get('/search', serviceController.searchServices);                    
router.get('/dashboard/search', protect, serviceController.searchUserServices); 
router.get('/admin/search', protect, admin, serviceController.searchAdminServices);  

//  GET BY ID (Must be LAST) 
router.get('/:id', serviceController.getServiceById);

export default router;