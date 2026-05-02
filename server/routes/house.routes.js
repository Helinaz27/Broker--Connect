import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as houseController from '../controllers/house.controller.js';
import { createHouseValidator, updateHouseValidator } from '../validators/house.validator.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();
router.post('/', protect, uploadMultiple, handleUploadError, createHouseValidator, houseController.createHouse);

router.put('/:id', protect, uploadMultiple, handleUploadError, updateHouseValidator, houseController.updateHouse);
router.put('/:id/status', protect, houseController.updateHouseStatus);


router.get('/', houseController.getAllHouses); 
router.get('/my', protect, houseController.getMyHouses);
router.get('/admin/all', protect, admin, houseController.adminGetAllHouses);

router.get('/search', houseController.searchHouses);
router.get('/:id', houseController.getHouseById);
router.get('/dashboard/search', protect, houseController.searchUserHouses);
router.get('/admin/search', protect, admin, houseController.searchAdminHouses);

export default router;