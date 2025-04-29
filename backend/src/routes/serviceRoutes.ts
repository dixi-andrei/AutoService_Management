import express from 'express';
import { serviceController } from '../controllers/serviceController';

const router = express.Router();

// Rute pentru servicii de reparații
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/receive', serviceController.receiveCarForService);
router.put('/:id/process', serviceController.processCarService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

// Rută specializată pentru serviciul asociat unei programări
router.get('/appointment/:appointmentId', serviceController.getServiceByAppointment);

export default router;