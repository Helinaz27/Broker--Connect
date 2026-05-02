import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as carController from '../controllers/car.controller.js';
import { createCarValidator, updateCarValidator } from '../validators/car.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  CREATE 
router.post('/', protect, uploadMultiple, handleUploadError, createCarValidator, carController.createCar);

//  UPDATE 
router.put('/:id', protect, uploadMultiple, handleUploadError, updateCarValidator, carController.updateCar);
router.put('/:id/status', protect, carController.updateCarStatus);

//  GET 
router.get('/', carController.getAllCars);                          
router.get('/my', protect, carController.getMyCars);                 
router.get('/admin/all', protect, admin, carController.adminGetAllCars); 
router.get('/search', carController.searchCars);                     
router.get('/dashboard/search', protect, carController.searchUserCars); 
router.get('/admin/search', protect, admin, carController.searchAdminCars); 

//  GET BY ID (Must be LAST) 
router.get('/:id', carController.getCarById);

export default router;