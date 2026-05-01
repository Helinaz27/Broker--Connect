import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as houseController from '../controllers/house.controller.js';
import { createHouseValidator, updateHouseValidator } from '../validators/house.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

//  CREATE 
router.post('/', protect, uploadMultiple, handleUploadError, createHouseValidator, houseController.createHouse);

//  UPDATE 
router.put('/:id', protect, uploadMultiple, handleUploadError, updateHouseValidator, houseController.updateHouse);
router.put('/:id/status', protect, houseController.updateHouseStatus);

//  GET (All with pagination) 
router.get('/', protect, houseController.getAllHouses);
router.get('/my', protect, houseController.getMyHouses);
router.get('/owner/:ownerId', protect, houseController.getHousesByOwner);
router.get('/type/:houseType', protect, houseController.getHousesByType);
router.get('/city/:city', protect, houseController.getHousesByCity);
router.get('/price/:min/:max', protect, houseController.getHousesByPrice);

//admin routes
router.get('/admin/all', protect, admin, houseController.adminGetAllHouses);
// GET http://localhost:5000/api/houses/admin/all?status=active
// GET http://localhost:5000/api/houses/admin/all?status=inactive
// GET http://localhost:5000/api/houses/admin/all?status=all

export default router;