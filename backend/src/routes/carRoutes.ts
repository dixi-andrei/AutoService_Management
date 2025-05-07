import express from 'express';
import { carController } from '../controllers/carController';

const router = express.Router();

//rutele pentru masini
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);
router.patch('/:id/deactivate', carController.deactivateCar);
router.patch('/:id/reactivate', carController.reactivateCar);

//rutele pentru masini in functie de client adica detinatorul masinii
router.get('/client/:clientId', carController.getClientCars);

export default router;