import express from 'express';
import { serviceController } from '../controllers/serviceController';

const router = express.Router();

//rute pentru service
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/receive', serviceController.receiveCarForService);
router.put('/:id/process', serviceController.processCarService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

//rutele pentru service in functie de progrmare
router.get('/appointment/:appointmentId', serviceController.getServiceByAppointment);

export default router;