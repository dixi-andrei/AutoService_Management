import { Request, Response } from 'express';
import { DataService } from '../utils/dataService';
import { Client } from '../models/interfaces';

const clientService = new DataService<Client>('clients.json');

export const clientController = {

    //toti clientii
    getAllClients: async (req: Request, res: Response) => {
        try {
            let clients = await clientService.getAll();

            //filtrare dupa status
            const { status } = req.query;
            if (status === 'active') {
                clients = clients.filter(client => client.isActive);
            } else if (status === 'inactive') {
                clients = clients.filter(client => !client.isActive);
            }

            res.status(200).json(clients);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea clientilor', error });
        }
    },

    //client dupa id
    getClientById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const client = await clientService.getById(id);

            if (!client) {
                return res.status(404).json({ message: 'Clientul nu a fost gasit' });
            }

            res.status(200).json(client);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la obtinerea clientului', error });
        }
    },

    //post client
    createClient: async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, phoneNumbers, email } = req.body;

            if (!firstName || !lastName || !phoneNumbers || !email) {
                return res.status(400).json({ message: 'Toate campurile sunt obligatorii' });
            }

            const clientData: Omit<Client, 'id'> = {
                firstName,
                lastName,
                phoneNumbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers],
                email,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as Omit<Client, 'id'>;

            const newClient = await clientService.create(clientData);

            res.status(201).json(newClient);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la crearea clientului', error });
        }
    },

    //put client
    updateClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: Partial<Client> = req.body;

            const updatedClient = await clientService.update(id, updates);

            if (!updatedClient) {
                return res.status(404).json({ message: 'Clientul nu a fost gasit' });
            }

            res.status(200).json(updatedClient);
        } catch (error) {
            res.status(500).json({ message: 'Eroare la actualizarea clientului', error });
        }
    },

    //stergere client
    deleteClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const success = await clientService.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Clientul nu a fost gasit' });
            }

            res.status(200).json({ message: 'Client sters cu succes' });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la stergerea clientului', error });
        }
    },

    //dezactivare client(soft delete)
    deactivateClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deactivatedClient = await clientService.deactivate(id);

            if (!deactivatedClient) {
                return res.status(404).json({ message: 'Clientul nu a fost gasit' });
            }

            res.status(200).json({ message: 'Client dezactivat cu succes', client: deactivatedClient });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la dezactivarea clientului', error });
        }
    },

    //reactivare client
    reactivateClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const reactivatedClient = await clientService.reactivate(id);

            if (!reactivatedClient) {
                return res.status(404).json({ message: 'Clientul nu a fost gasit' });
            }

            res.status(200).json({ message: 'Client reactivat cu succes', client: reactivatedClient });
        } catch (error) {
            res.status(500).json({ message: 'Eroare la reactivarea clientului', error });
        }
    }
};
