import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Service, Appointment } from '../models/interfaces';

const serviceService = new DataService<Service>('services.json');
const appointmentService = new DataService<Appointment>('appointments.json');

export const serviceController = {

    //toate serviciile
    getAllServices: async (req: Request, res: Response) => {
        try {
            let services = await serviceService.getAll();

            //filtrare dupa appointmentId
            const { appointmentId } = req.query;
            if (appointmentId) {
                services = services.filter(service => service.appointmentId === appointmentId);
            }

            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea serviciilor', error });
        }
    },

    //serviciu dupa id
    getServiceById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const service = await serviceService.getById(id);

            if (!service) {
                return res.status(404).json({ message: 'Serviciul nu a fost gasit' });
            }

            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea serviciului', error });
        }
    },

    //primire masina in service
    receiveCarForService: async (req: Request, res: Response) => {
        try {
            const {
                appointmentId,
                visualIssues,
                clientReportedIssues,
                purpose
            } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'ID-ul programarii este obligatoriu' });
            }

            const appointment = await appointmentService.getById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            const existingServices = await serviceService.getAll();
            const serviceExists = existingServices.some(service => service.appointmentId === appointmentId);

            if (serviceExists) {
                return res.status(400).json({ message: 'Exista deja un serviciu pentru aceasta programare' });
            }

            await appointmentService.update(appointmentId, {
                status: 'in-progress',
                updatedAt: new Date()
            });

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

    //procesare masina
    processCarService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const {
                operations,
                actualDuration
            } = req.body;

            if (!operations || !actualDuration) {
                return res.status(400).json({ message: 'Campurile obligatorii lipsesc' });
            }

            if (actualDuration % 10 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie sa fie multiplu de 10 minute' });
            }

            const service = await serviceService.getById(id);
            if (!service) {
                return res.status(404).json({ message: 'Serviciul nu a fost gasit' });
            }

            const updatedService = await serviceService.update(id, {
                operations,
                actualDuration,
                updatedAt: new Date()
            });

            await appointmentService.update(service.appointmentId, {
                status: 'completed',
                updatedAt: new Date()
            });

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea serviciului', error });
        }
    },

    //actualizare serviciu
    updateService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Service> = req.body;

            if (updates.actualDuration && updates.actualDuration % 10 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie sa fie multiplu de 10 minute' });
            }

            const updatedService = await serviceService.update(id, updates);

            if (!updatedService) {
                return res.status(404).json({ message: 'Serviciul nu a fost gasit' });
            }

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea serviciului', error });
        }
    },

    //stergere serviciu
    deleteService: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await serviceService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Serviciul nu a fost gasit' });
            }

            res.status(200).json({ message: 'Serviciu sters cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la stergerea serviciului', error });
        }
    },

    //serviciu dupa programare
    getServiceByAppointment: async (req: Request, res: Response) => {
        try {
            const { appointmentId } = req.params;
            const services = await serviceService.getAll();
            const service = services.find(s => s.appointmentId === appointmentId);

            if (!service) {
                return res.status(404).json({ message: 'Nu a fost gasit niciun serviciu pentru aceasta programare' });
            }

            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea serviciului', error });
        }
    }
};
