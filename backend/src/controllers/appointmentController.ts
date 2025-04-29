import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Appointment } from '../models/interfaces';

// Inițializăm serviciul de date pentru programări
const appointmentService = new DataService<Appointment>('appointments.json');

/**
 * Controller pentru operațiunile cu programări
 */
export const appointmentController = {
    /**
     * Obține toate programările
     */
    getAllAppointments: async (req: Request, res: Response) => {
        try {
            let appointments = await appointmentService.getAll();

            // Filtrări opționale
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
                // Filtrare după data programării (format YYYY-MM-DD)
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
            res.status(500).json({ message: 'Eroare la obținerea programărilor', error });
        }
    },

    /**
     * Obține o programare după ID
     */
    getAppointmentById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getById(id);

            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            res.status(200).json(appointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea programării', error });
        }
    },

    /**
     * Adaugă o programare nouă
     */
    createAppointment: async (req: Request, res: Response) => {
        try {
            const {
                clientId, carId, date, duration, serviceType,
                contactMethod, notes
            } = req.body;

            // Validare
            if (!clientId || !carId || !date || !duration || !serviceType || !contactMethod) {
                return res.status(400).json({ message: 'Câmpurile obligatorii lipsesc' });
            }

            // Validare pentru durata (multiplu de 30 minute)
            if (duration % 30 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie să fie multiplu de 30 minute' });
            }

            // Validare pentru intervalul orar 8-17
            const appointmentDate = new Date(date);
            const hour = appointmentDate.getHours();
            if (hour < 8 || hour >= 17) {
                return res.status(400).json({ message: 'Programările sunt disponibile doar între 8:00 și 17:00' });
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
            res.status(500).json({ message: 'Eroare la crearea programării', error });
        }
    },

    /**
     * Actualizează o programare existentă
     */
    updateAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Appointment> = req.body;

            // Validare pentru durata (multiplu de 30 minute)
            if (updates.duration && updates.duration % 30 !== 0) {
                return res.status(400).json({ message: 'Durata trebuie să fie multiplu de 30 minute' });
            }

            // Validare pentru intervalul orar 8-17 dacă data este actualizată
            if (updates.date) {
                const appointmentDate = new Date(updates.date);
                const hour = appointmentDate.getHours();
                if (hour < 8 || hour >= 17) {
                    return res.status(400).json({ message: 'Programările sunt disponibile doar între 8:00 și 17:00' });
                }
            }

            const updatedAppointment = await appointmentService.update(id, updates);

            if (!updatedAppointment) {
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            res.status(200).json(updatedAppointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea programării', error });
        }
    },

    /**
     * Șterge o programare
     */
    deleteAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await appointmentService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            res.status(200).json({ message: 'Programare ștearsă cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la ștergerea programării', error });
        }
    },

    /**
     * Anulează o programare
     */
    cancelAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getById(id);

            if (!appointment) {
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            if (appointment.status === 'cancelled') {
                return res.status(400).json({ message: 'Programarea este deja anulată' });
            }

            const updatedAppointment = await appointmentService.update(id, {
                status: 'cancelled',
                updatedAt: new Date()
            });

            res.status(200).json({ message: 'Programare anulată cu succes', appointment: updatedAppointment });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la anularea programării', error });
        }
    },

    /**
     * Actualizează statusul unei programări
     */
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
                return res.status(404).json({ message: 'Programarea nu a fost găsită' });
            }

            res.status(200).json(updatedAppointment);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea statusului programării', error });
        }
    },

    /**
     * Obține toate programările unui client
     */
    getClientAppointments: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const appointments = await appointmentService.getAll();
            const clientAppointments = appointments.filter(app => app.clientId === clientId);

            res.status(200).json(clientAppointments);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea programărilor clientului', error });
        }
    },

    /**
     * Obține toate programările pentru o mașină
     */
    getCarAppointments: async (req: Request, res: Response) => {
        try {
            const { carId } = req.params;
            const appointments = await appointmentService.getAll();
            const carAppointments = appointments.filter(app => app.carId === carId);

            res.status(200).json(carAppointments);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea programărilor mașinii', error });
        }
    }
};