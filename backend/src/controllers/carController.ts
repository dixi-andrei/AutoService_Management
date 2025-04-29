import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Car } from '../models/interfaces';

// Inițializăm serviciul de date pentru mașini
const carService = new DataService<Car>('cars.json');

/**
 * Controller pentru operațiunile cu mașini
 */
export const carController = {
    /**
     * Obține toate mașinile
     */
    getAllCars: async (req: Request, res: Response) => {
        try {
            let cars = await carService.getAll();

            // Filtrăm după clientId dacă există
            const { clientId, status } = req.query;

            if (clientId) {
                cars = cars.filter(car => car.clientId === clientId);
            }

            // Filtrăm după status dacă există parametrul în query
            if (status === 'active') {
                cars = cars.filter(car => car.isActive);
            } else if (status === 'inactive') {
                cars = cars.filter(car => !car.isActive);
            }

            res.status(200).json(cars);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea mașinilor', error });
        }
    },

    /**
     * Obține o mașină după ID
     */
    getCarById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const car = await carService.getById(id);

            if (!car) {
                return res.status(404).json({ message: 'Mașina nu a fost găsită' });
            }

            res.status(200).json(car);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea mașinii', error });
        }
    },

    /**
     * Adaugă o mașină nouă
     */
    createCar: async (req: Request, res: Response) => {
        try {
            const {
                clientId, licensePlate, vin, make, model, year,
                engineType, engineCapacity, horsePower
            } = req.body;

            // Validare
            if (!clientId || !licensePlate || !vin || !make || !model || !year || !engineType) {
                return res.status(400).json({ message: 'Câmpurile obligatorii lipsesc' });
            }

            // Calcularea kilowatts din cai putere (1 CP ≈ 0.7355 kW)
            const hpNumber = horsePower ? parseInt(horsePower.toString()) : 0;
            const kilowatts = hpNumber ? Math.round(hpNumber * 0.7355 * 100) / 100 : 0;

            const carData: Omit<Car, 'id'> = {
                clientId,
                licensePlate,
                vin,
                make,
                model,
                year: parseInt(year.toString()),
                engineType,
                engineCapacity: engineCapacity ? parseFloat(engineCapacity.toString()) : 0,
                horsePower: hpNumber,
                kilowatts,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as Omit<Car, 'id'>;

            const newCar = await carService.create(carData);

            res.status(201).json(newCar);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la crearea mașinii', error });
        }
    },

    /**
     * Actualizează o mașină existentă
     */
    updateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Car> = req.body;

            // Recalcularea kilowatts dacă se actualizează horsePower
            if (updates.horsePower) {
                updates.kilowatts = Math.round(updates.horsePower * 0.7355 * 100) / 100;
            }

            const updatedCar = await carService.update(id, updates);

            if (!updatedCar) {
                return res.status(404).json({ message: 'Mașina nu a fost găsită' });
            }

            res.status(200).json(updatedCar);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea mașinii', error });
        }
    },

    /**
     * Șterge o mașină
     */
    deleteCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await carService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Mașina nu a fost găsită' });
            }

            res.status(200).json({ message: 'Mașină ștearsă cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la ștergerea mașinii', error });
        }
    },

    /**
     * Dezactivează o mașină (soft delete)
     */
    deactivateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deactivatedCar = await carService.deactivate(id);

            if (!deactivatedCar) {
                return res.status(404).json({ message: 'Mașina nu a fost găsită' });
            }

            res.status(200).json({ message: 'Mașină dezactivată cu succes', car: deactivatedCar });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la dezactivarea mașinii', error });
        }
    },

    /**
     * Reactivează o mașină
     */
    reactivateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const reactivatedCar = await carService.reactivate(id);

            if (!reactivatedCar) {
                return res.status(404).json({ message: 'Mașina nu a fost găsită' });
            }

            res.status(200).json({ message: 'Mașină reactivată cu succes', car: reactivatedCar });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la reactivarea mașinii', error });
        }
    },

    /**
     * Obține toate mașinile unui client
     */
    getClientCars: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const cars = await carService.getAll();
            const clientCars = cars.filter(car => car.clientId === clientId);

            res.status(200).json(clientCars);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obținerea mașinilor clientului', error });
        }
    }
};