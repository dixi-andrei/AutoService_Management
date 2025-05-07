import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Car } from '../models/interfaces';

const carService = new DataService<Car>('cars.json');

export const carController = {

    //toate masinile
    getAllCars: async (req: Request, res: Response) => {
        try {
            let cars = await carService.getAll();

            //filtrare dupa clientId
            const { clientId, status } = req.query;

            if (clientId) {
                cars = cars.filter(car => car.clientId === clientId);
            }

            //filtrare dupa status
            if (status === 'active') {
                cars = cars.filter(car => car.isActive);
            } else if (status === 'inactive') {
                cars = cars.filter(car => !car.isActive);
            }

            res.status(200).json(cars);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea masinilor', error });
        }
    },

    //masina dupa id
    getCarById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const car = await carService.getById(id);

            if (!car) {
                return res.status(404).json({ message: 'Masina nu a fost gasita' });
            }

            res.status(200).json(car);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea masinii', error });
        }
    },

    //post masina
    createCar: async (req: Request, res: Response) => {
        try {
            const {
                clientId, licensePlate, vin, make, model, year,
                engineType, engineCapacity, horsePower
            } = req.body;

            if (!clientId || !licensePlate || !vin || !make || !model || !year || !engineType) {
                return res.status(400).json({ message: 'Campurile obligatorii lipsesc' });
            }

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
            res.status(500).json({ message: 'Eroare la crearea masinii', error });
        }
    },

    //put masina
    updateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Car> = req.body;

            if (updates.horsePower) {
                updates.kilowatts = Math.round(updates.horsePower * 0.7355 * 100) / 100;
            }

            const updatedCar = await carService.update(id, updates);

            if (!updatedCar) {
                return res.status(404).json({ message: 'Masina nu a fost gasita' });
            }

            res.status(200).json(updatedCar);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea masinii', error });
        }
    },

    //stergere masina
    deleteCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await carService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Masina nu a fost gasita' });
            }

            res.status(200).json({ message: 'Masina stearsa cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la stergerea masinii', error });
        }
    },

    //dezactivare masina(soft delete)
    deactivateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deactivatedCar = await carService.deactivate(id);

            if (!deactivatedCar) {
                return res.status(404).json({ message: 'Masina nu a fost gasita' });
            }

            res.status(200).json({ message: 'Masina dezactivata cu succes', car: deactivatedCar });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la dezactivarea masinii', error });
        }
    },

    //reactivare masina
    reactivateCar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const reactivatedCar = await carService.reactivate(id);

            if (!reactivatedCar) {
                return res.status(404).json({ message: 'Masina nu a fost gasita' });
            }

            res.status(200).json({ message: 'Masina reactivata cu succes', car: reactivatedCar });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la reactivarea masinii', error });
        }
    },

    //toate masinile unui client
    getClientCars: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const cars = await carService.getAll();
            const clientCars = cars.filter(car => car.clientId === clientId);

            res.status(200).json(clientCars);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea masinilor clientului', error });
        }
    }
};
