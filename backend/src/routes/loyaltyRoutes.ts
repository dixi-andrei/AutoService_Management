import express from 'express';
import { loyaltyController } from '../controllers/loyaltyController';

const router = express.Router();

//rutele pentru sistemul de loialitate
router.get('/', loyaltyController.getAllLoyaltyRecords);
router.get('/:id', loyaltyController.getLoyaltyById);
router.get('/client/:clientId', loyaltyController.getClientLoyalty);
router.post('/client/:clientId', loyaltyController.updateClientLoyalty);
router.delete('/:id', loyaltyController.deleteLoyalty);
router.post('/calculate-discount', loyaltyController.calculateDiscount);

export default router;