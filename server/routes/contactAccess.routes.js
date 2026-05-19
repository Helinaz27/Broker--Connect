import express from 'express';
import { can } from '../middleware/can.js';
import * as contactAccessController from '../controllers/contactAccess.controller.js';
import { accessContactValidator } from '../validators/contactAccess.validator.js';

const router = express.Router();

router.post('/access', can('contactAccess', 'createOwn'), accessContactValidator, contactAccessController.accessContact);
router.get('/my-accesses', can('contactAccess', 'readOwn'), contactAccessController.getMyAccesses);

router.get('/admin/all', can('contactAccess', 'manage'), contactAccessController.adminGetAllAccesses);
router.get('/admin/listing/:listingId', can('contactAccess', 'manage'), contactAccessController.adminGetAccessesByListing);
router.get('/admin/user/:userId', can('contactAccess', 'manage'), contactAccessController.adminGetAccessesByUser);


export default router;