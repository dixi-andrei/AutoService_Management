import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Service, Appointment } from '../models/interfaces';

// Inițializăm serviciile de date pentru reparații și programări
const serviceService = new DataService<Service>('services.json');
const appointmentService = new DataService<Appointment>('appointments.json');

/**
 * Controller pentru operațiunile cu servicii de reparații
 */
export const serviceController = {
    /**
     * Obține toate serviciile de reparații
     */
    getAllServices: async (req: Request, res: Response) => {
        try {
            let services = await serviceService.getAll();

            // Filtrare opțională după appointmentId
            const { appointmentId } = req.query;
            if (appointmentId) {
                services = services.filter(service => service.appointmentId === appointmentId);
            }

            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea serviciilor', error });
        }
    },

    /**
     * Obține un serviciu după ID
     */
    getServiceById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const service = await serviceService.getById(id);

            if (!service) {
                return res.status(404).json({ message: 'Serviciul nu a fost găsit' });
            }

            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea serviciului', error });
        }
    },

    /**
     * Creează un nou serviciu de reparații (primire mașină)
     */
    receiveCarForService: async (req: Request, res: Response) => {
        try {
            const {
                appointmentId,
                visualIssues,
                clientReportedIssues,
                purpose
            } = req.body;

            // Validare
            if (!appointmentId) {
                return res.status(400).json({ message: 'ID-ul programării este obligatoriu' });
            }

            // Verificăm dacă programarea există
            const appointment = await appointmentService.getById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            // Verificăm dacă există deja un serviciu pentru această programare
            const existingServices = await serviceService.getAll();
            const serviceExists = existingServices.some(service => service.appointmentId === appointmentId);

            if (serviceExists) {
                return res.status(400).json({ message: 'Există deja un serviciu pentru această programare' });
            }

            // Actualizăm statusul programării la "in-progress"
            await appointmentService.update(appointmentId, {
                status: 'in-progress',
                updatedAt: new Date()
            });

            // Creăm serviciul
            const serviceData: Omit<Service, 'id'> = {
                appointmentId,
                initialState: {
                    visualIssues: visualIssues || [],
                    clientReportedIssues: clientReportedIssues || [],
                    purpose: purpose || 'verificare'
                },
                operations: {
                    description: '',
                    replacedParts: [],
                    detectedIssues: [],
                    resolvedIssues: false
                },
                actualDuration: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            } as unknown as Omit<Service, 'id'>;

            const newService = await serviceService.create(serviceData);

            res.status(201).json(newService);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la crearea serviciului', error });
        }
    },

    /**
     * Actualizează informațiile despre procesarea unei mașini
     */
    processCarService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const {
                operations,
                actualDuration
            } = req.body;

            // Validare
            if (!operations || !actualDuration) {
                return res.status(400).json({ message: 'Câmpurile obligatorii lipsesc' });
            }

            // Validare pentru durata efectivă (multiplu de 10 minute)
            if (actualDuration % 10 !== 0) {
                return res.status(400).json({ message: 'Durata efectivă trebuie să fie multiplu de 10 minute' });
            }

            // Obținem serviciul
            const service = await serviceService.getById(id);
            if (!service) {
                return res.status(404).json({ message: 'Serviciul nu a fost găsit' });
            }

            // Actualizăm serviciul
            const updatedService = await serviceService.update(id, {
                operations,
                actualDuration,
                updatedAt: new Date()
            });

            // Actualizăm statusul programării la "completed"
            await appointmentService.update(service.appointmentId, {
                status: 'completed',
                updatedAt: new Date()
            });

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea serviciului', error });
        }
    },

    /**
     * Actualizează un serviciu existent
     */
    updateService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Service> = req.body;

            // Validare pentru durata efectivă (multiplu de 10 minute)
            if (updates.actualDuration && updates.actualDuration % 10 !== 0) {
                return res.status(400).json({ message: 'Durata efectivă trebuie să fie multiplu de 10 minute' });
            }

            const updatedService = await serviceService.update(id, updates);

            if (!updatedService) {
                return res.status(404).json({ message: 'Serviciul nu a fost găsit' });
            }

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea serviciului', error });
        }
    },

    /**
     * Șterge un serviciu
     */
    deleteService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await serviceService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Serviciul nu a fost găsit' });
            }

            res.status(200).json({ message: 'Serviciu șters cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la ștergerea serviciului', error });
        }
    },

    /**
     * Obține serviciul asociat unei programări
     */
    getServiceByAppointment: async (req: Request, res: Response) => {
        try {
            const { appointmentId } = req.params;
            const services = await serviceService.getAll();
            const service = services.find(s => s.appointmentId === appointmentId);

            if (!service) {
                return res.status(404).json({ message: 'Nu a fost găsit niciun serviciu pentru această programare' });
            }

            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea serviciului', error });
        }
    }
};