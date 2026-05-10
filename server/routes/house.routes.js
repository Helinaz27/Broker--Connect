import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as houseController from '../controllers/house.controller.js';
import { createHouseValidator, updateHouseValidator } from '../validators/house.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  Public Routes 
router.get('/', houseController.getAllHouses);
router.get('/search', houseController.searchHouses);

//  Protected User Routes 
router.post('/', protect, uploadMultiple, handleUploadError, createHouseValidator, houseController.createHouse);
router.get('/my-houses', protect, houseController.getMyHouses);
router.put('/:id', protect, uploadMultiple, handleUploadError, updateHouseValidator, houseController.updateHouse);
router.put('/:id/status', protect, houseController.updateHouseStatus);
router.delete('/:id', protect, houseController.deleteHouse);

//  Admin Routes 
router.get('/admin/all', protect, admin, houseController.adminGetAllHouses);
router.get('/admin/search', protect, admin, houseController.searchAdminHouses);
router.put('/admin/:id/status', protect, admin, houseController.updateHouseStatus);
router.delete('/admin/:id', protect, admin, houseController.deleteHouse);

// Dynamic Param —
router.get('/:id', houseController.getHouseById);

export default router;