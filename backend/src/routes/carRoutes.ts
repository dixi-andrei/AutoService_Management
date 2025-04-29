import express from 'express';
import { carController } from '../controllers/carController';

const router = express.Router();

// Rute pentru mașini
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);
router.patch('/:id/deactivate', carController.deactivateCar);
router.patch('/:id/reactivate', carController.reactivateCar);

// Rută specializată pentru mașinile unui client
router.get('/client/:clientId', carController.getClientCars);

export default router;