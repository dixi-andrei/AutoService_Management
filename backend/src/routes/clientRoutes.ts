import express from 'express';
import { clientController } from '../controllers/clientController';

const router = express.Router();

//rutele pentru clienti
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.patch('/:id/deactivate', clientController.deactivateClient);
router.patch('/:id/reactivate', clientController.reactivateClient);

export default router;