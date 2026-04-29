import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as houseController from '../controllers/house.controller.js';
import { createHouseValidator, updateHouseValidator } from '../validators/house.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  USER HOUSE ROUTES 
router.post('/', protect, uploadMultiple, handleUploadError, createHouseValidator, houseController.createHouse);
router.get('/my-listings', protect, houseController.getMyHouses);
router.get('/:id', protect, houseController.getHouseById);
router.put('/:id', protect, uploadMultiple, handleUploadError, updateHouseValidator, houseController.updateHouse);
router.delete('/:id', protect, houseController.deleteHouse);
router.put('/:id/status', protect, houseController.updateHouseStatus);

//  PUBLIC HOUSE ROUTES 
router.get('/', houseController.getAllHouses);
router.get('/search/:city', houseController.searchHousesByCity);

//  ADMIN HOUSE ROUTES 
router.get('/admin/all', protect, admin, houseController.adminGetAllHouses);
router.put('/admin/:id/status', protect, admin, houseController.adminUpdateHouseStatus);
router.delete('/admin/:id', protect, admin, houseController.adminDeleteHouse);

export default router;