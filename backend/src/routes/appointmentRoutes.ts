import express from 'express';
import { appointmentController } from '../controllers/appointmentController';

const router = express.Router();

//rutele clasice pentru programari
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

//rutele in functie de client si masina
router.get('/client/:clientId', appointmentController.getClientAppointments);
router.get('/car/:carId', appointmentController.getCarAppointments);

export default router;