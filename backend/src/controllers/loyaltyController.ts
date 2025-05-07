import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { LoyaltyProgram, Appointment, Service } from '../models/interfaces';

const loyaltyService = new DataService<LoyaltyProgram>('loyalty.json');
const appointmentService = new DataService<Appointment>('appointments.json');
const serviceService = new DataService<Service>('services.json');

/**
 * Feature sistem de loialitate pentru clienti
 *
 * Acest mic feature implementateza 5 clase de loialitate (A1 - A5) cu diferite reduceri
 * in functie de nr-ul de servicii sau suma cheltuita.
 * tipul clasei de loialitate se poate actualiza automat sau manual
 */

export const loyaltyController = {

    //toate inregistrarile de loialitate
    getAllLoyaltyRecords: async (req: Request, res: Response) => {
        try {
            let records = await loyaltyService.getAll();
            const { clientId, loyaltyClass } = req.query;

            if (clientId) {
                records = records.filter(record => record.clientId === clientId);
            }

            if (loyaltyClass) {
                records = records.filter(record => record.loyaltyClass === loyaltyClass);
            }

            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea inregistrarilor de loialitate', error });
        }
    },

    //inregistrare loialitate dupa id
    getLoyaltyById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const loyalty = await loyaltyService.getById(id);

            if (!loyalty) {
                return res.status(404).json({ message: 'Inregistrarea de loialitate nu a fost gasita' });
            }

            res.status(200).json(loyalty);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea inregistrarii de loialitate', error });
        }
    },

    //inregistrare loialitate a unui client
    getClientLoyalty: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const records = await loyaltyService.getAll();
            const clientLoyalty = records.find(record => record.clientId === clientId);

            if (!clientLoyalty) {
                return res.status(404).json({ message: 'Clientul nu are program de loialitate' });
            }

            res.status(200).json(clientLoyalty);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea programului de loialitate', error });
        }
    },

    //creeaza sau actualizeaza programul de loialitate al unui client
    updateClientLoyalty: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const records = await loyaltyService.getAll();
            const existingRecord = records.find(record => record.clientId === clientId);

            if (existingRecord) {
                if (req.body.loyaltyClass || req.body.discountPercentage) {
                    const updates = {
                        ...req.body,
                        updatedAt: new Date()
                    };
                    const updated = await loyaltyService.update(existingRecord.id, updates);
                    return res.status(200).json(updated);
                }

                const appointments = await appointmentService.getAll();
                const clientAppointments = appointments.filter(app => app.clientId === clientId);

                const services = await serviceService.getAll();
                const clientServices = services.filter(service =>
                    clientAppointments.some(app => app.id === service.appointmentId)
                );

                const totalServiceCount = clientServices.length;
                const totalSpent = clientServices.reduce(sum => sum + 100, 0); // presupunem 100 lei/serviciu

                let loyaltyClass: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' = 'A1';
                let discountPercentage = 0;

                if (totalServiceCount >= 20 || totalSpent >= 10000) {
                    loyaltyClass = 'A5'; discountPercentage = 15;
                } else if (totalServiceCount >= 15 || totalSpent >= 7500) {
                    loyaltyClass = 'A4'; discountPercentage = 12;
                } else if (totalServiceCount >= 10 || totalSpent >= 5000) {
                    loyaltyClass = 'A3'; discountPercentage = 9;
                } else if (totalServiceCount >= 5 || totalSpent >= 2500) {
                    loyaltyClass = 'A2'; discountPercentage = 6;
                } else if (totalServiceCount >= 2 || totalSpent >= 1000) {
                    loyaltyClass = 'A1'; discountPercentage = 3;
                }

                const updates = {
                    loyaltyClass,
                    discountPercentage,
                    totalServiceCount,
                    totalSpent,
                    lastVisitDate: new Date(),
                    nextEvaluationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date()
                };

                const updated = await loyaltyService.update(existingRecord.id, updates);
                return res.status(200).json(updated);
            } else {
                const newLoyaltyData: Omit<LoyaltyProgram, 'id'> = {
                    clientId,
                    loyaltyClass: 'A1',
                    discountPercentage: 3,
                    totalServiceCount: 1,
                    totalSpent: 0,
                    lastVisitDate: new Date(),
                    nextEvaluationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const created = await loyaltyService.create(newLoyaltyData);
                return res.status(201).json(created);
            }
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea programului de loialitate', error });
        }
    },

    //stergere inregistrare loialitate
    deleteLoyalty: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await loyaltyService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Inregistrarea de loialitate nu a fost gasita' });
            }

            res.status(200).json({ message: 'Inregistrare stearsa cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la stergerea inregistrarii de loialitate', error });
        }
    },

    //calculeaza reducerea
    calculateDiscount: async (req: Request, res: Response) => {
        try {
            const { clientId, amount } = req.body;

            if (!clientId || !amount) {
                return res.status(400).json({ message: 'clientId si suma sunt obligatorii' });
            }

            const records = await loyaltyService.getAll();
            const clientLoyalty = records.find(r => r.clientId === clientId);

            const originalAmount = parseFloat(amount.toString());
            const discountPercentage = clientLoyalty?.discountPercentage || 0;
            const discountAmount = Math.round(originalAmount * discountPercentage) / 100;
            const finalAmount = Math.round((originalAmount - discountAmount) * 100) / 100;

            res.status(200).json({
                originalAmount,
                discountPercentage,
                discountAmount,
                finalAmount,
                loyaltyClass: clientLoyalty?.loyaltyClass
            });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la calcularea reducerii', error });
        }
    }
};
