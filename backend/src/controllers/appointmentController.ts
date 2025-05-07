import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Appointment } from '../models/interfaces';

const appointmentService = new DataService<Appointment>('appointments.json');

//controller programari
export const appointmentController = {

    //toate programarile
    getAllAppointments: async (req: Request, res: Response) => {
        try {
            let appointments = await appointmentService.getAll();

            //filtrare
            const { clientId, carId, status, date } = req.query;

            if (clientId) {
                appointments = appointments.filter(app => app.clientId === clientId);
            }

            if (carId) {
                appointments = appointments.filter(app => app.carId === carId);
            }

            if (status) {
                appointments = appointments.filter(app => app.status === status);
            }

            if (date) {
                const filterDate = new Date(date as string);
                appointments = appointments.filter(app => {
                    const appDate = new Date(app.date);
                    return appDate.getFullYear() === filterDate.getFullYear() &&
                        appDate.getMonth() === filterDate.getMonth() &&
                        appDate.getDate() === filterDate.getDate();
                });
            }

            res.status(200).json(appointments);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea programarilor', error });
        }
    },

    //programarea dupa id
    getAppointmentById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getById(id);

            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            res.status(200).json(appointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea programarii', error });
        }
    },

    //post programare
    createAppointment: async (req: Request, res: Response) => {
        try {
            const {
                clientId, carId, date, duration, serviceType,
                contactMethod, notes
            } = req.body;

            if (!clientId || !carId || !date || !duration || !serviceType || !contactMethod) {
                return res.status(400).json({ message: 'Campurile obligatorii lipsesc' });
            }

            if (duration % 30 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie sa fie multiplu de 30 minute' });
            }

            const appointmentDate = new Date(date);
            const hour = appointmentDate.getHours();
            if (hour < 8 || hour >= 17) {
                return res.status(400).json({ message: 'Programarile sunt disponibile doar intre 8:00 si 17:00' });
            }

            const appointmentData: Omit<Appointment, 'id'> = {
                clientId,
                carId,
                date: new Date(date),
                duration: parseInt(duration.toString()),
                serviceType,
                contactMethod,
                status: 'scheduled',
                notes: notes || '',
                createdAt: new Date(),
                updatedAt: new Date()
            } as Omit<Appointment, 'id'>;

            const newAppointment = await appointmentService.create(appointmentData);

            res.status(201).json(newAppointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la crearea programarii', error });
        }
    },

    //put programare
    updateAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Appointment> = req.body;

            if (updates.duration && updates.duration % 30 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie sa fie multiplu de 30 minute' });
            }

            if (updates.date) {
                const appointmentDate = new Date(updates.date);
                const hour = appointmentDate.getHours();
                if (hour < 8 || hour >= 17) {
                    return res.status(400).json({ message: 'Programarile sunt disponibile doar intre 8:00 si 17:00' });
                }
            }

            const updatedAppointment = await appointmentService.update(id, updates);

            if (!updatedAppointment) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            res.status(200).json(updatedAppointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea programarii', error });
        }
    },

    //stergere programare
    deleteAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await appointmentService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            res.status(200).json({ message: 'Programare stearsa cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la stergerea programarii', error });
        }
    },

    //anulare programare
    cancelAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getById(id);

            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            if (appointment.status === 'cancelled') {
                return res.status(400).json({ message: 'Programarea este deja anulata' });
            }

            const updatedAppointment = await appointmentService.update(id, {
                status: 'cancelled',
                updatedAt: new Date()
            });

            res.status(200).json({ message: 'Programare anulata cu succes', appointment: updatedAppointment });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la anularea programarii', error });
        }
    },

    //put pentru status-ul programarii
    updateAppointmentStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({ message: 'Status invalid' });
            }

            const updatedAppointment = await appointmentService.update(id, {
                status,
                updatedAt: new Date()
            });

            if (!updatedAppointment) {
                return res.status(404).json({ message: 'Programarea nu a fost gasita' });
            }

            res.status(200).json(updatedAppointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea statusului programarii', error });
        }
    },

    //toate programarile unui client
    getClientAppointments: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const appointments = await appointmentService.getAll();
            const clientAppointments = appointments.filter(app => app.clientId === clientId);

            res.status(200).json(clientAppointments);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea programarilor clientului', error });
        }
    },

    //toate programarile unei masini
    getCarAppointments: async (req: Request, res: Response) => {
        try {
            const { carId } = req.params;
            const appointments = await appointmentService.getAll();
            const carAppointments = appointments.filter(app => app.carId === carId);

            res.status(200).json(carAppointments);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea programarilor masinii', error });
        }
    }
};
