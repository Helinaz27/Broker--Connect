import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as carController from '../controllers/car.controller.js';
import { createCarValidator, updateCarValidator } from '../validators/car.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  USER CAR ROUTES 
router.post('/', protect, uploadMultiple, handleUploadError, createCarValidator, carController.createCar);
router.get('/my-listings', protect, carController.getMyCars);
router.get('/:id', protect, carController.getCarById);
router.put('/:id', protect, uploadMultiple, handleUploadError, updateCarValidator, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);
router.put('/:id/status', protect, carController.updateCarStatus);

//  PUBLIC CAR ROUTES 
router.get('/', carController.getAllCars);
router.get('/search/:city', carController.searchCarsByCity);

//  ADMIN CAR ROUTES 
router.get('/admin/all', protect, admin, carController.adminGetAllCars);
router.put('/admin/:id/status', protect, admin, carController.adminUpdateCarStatus);
router.delete('/admin/:id', protect, admin, carController.adminDeleteCar);

export default router;