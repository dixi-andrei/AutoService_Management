import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

//serviciul pentru manipularea datelor in format json
export class DataService<T extends { id: string }> {
    private filePath: string;
    private dataDir: string;

    constructor(fileName: string) {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.filePath = path.join(this.dataDir, fileName);

        //ma asigur ca directorul pentru date exista
        if (!fs.existsSync(this.dataDir)) {
            try {
                fs.mkdirSync(this.dataDir, { recursive: true });
                console.log(`Directorul ${this.dataDir} a fost creat.`);
            } catch (error) {
                console.error(`Eroare la crearea directorului ${this.dataDir}:`, error);
            }
        }

        //verific daca fisierul pentru modelul respectiv exista
        if (!fs.existsSync(this.filePath)) {
            try {
                fs.writeFileSync(this.filePath, JSON.stringify([]));
                console.log(`Fisierul ${fileName} a fost creat.`);
            } catch (error) {
                console.error(`Eroare la crearea fisierului ${fileName}:`, error);
            }
        }
    }

    //functie pentru a obtine toate entitatile
    async getAll(): Promise<T[]> {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            //am adaugat verificarea asta pentru cazul in care fisierul e gol
            return data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Eroare la citirea datelor:', error);
            return [];
        }
    }

    //entitate cautata dupa ID
    async getById(id: string): Promise<T | null> {
        try {
            const items = await this.getAll();
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error('Eroare la gasirea entitatii:', error);
            return null;
        }
    }
    //creeaza o entitate noua cu ID unic
    async create(item: Omit<T, 'id'>): Promise<T> {
        try {
            const items = await this.getAll();
            const newItem = {
                ...item,
                id: uuidv4(),  //generare id unic folosind uuid
                createdAt: new Date(),
                updatedAt: new Date()
            } as unknown as T;

            items.push(newItem);
            await fs.promises.writeFile(this.filePath, JSON.stringify(items, null, 2));
            return newItem;
        } catch (error) {
            console.error('Eroare la crearea entitatii:', error);
            throw error;
        }
    }

    //actualizare entitate existenta
    async update(id: string, updates: Partial<T>): Promise<T | null> {
        try {
            const items = await this.getAll();
            const index = items.findIndex(item => item.id === id);

            if (index === -1) return null; //daca nu exista, return null

            const updatedItem = {
                ...items[index],
                ...updates,
                updatedAt: new Date() //actualizez mereu timestamp-ul
            };

            items[index] = updatedItem;
            await fs.promises.writeFile(this.filePath, JSON.stringify(items, null, 2));
            return updatedItem;
        } catch (error) {
            console.error('Eroare la actualizarea entitatii:', error);
            return null;
        }
    }

   //stergere entiate din fisier
    async delete(id: string): Promise<boolean> {
        try {
            const items = await this.getAll();
            const filteredItems = items.filter(item => item.id !== id);

            //verific daca am sters ceva
            if (filteredItems.length === items.length) return false;

            await fs.promises.writeFile(this.filePath, JSON.stringify(filteredItems, null, 2));
            return true;
        } catch (error) {
            console.error('Eroare la stergerea entitatii:', error);
            return false;
        }
    }

    //dezactivare entitatte
    async deactivate(id: string): Promise<T | null> {
        try {
            //folosec functia upatte pentru a modifica doar isActive
            return this.update(id, { isActive: false } as unknown as Partial<T>);
        } catch (error) {
            console.error('Eroare la dezactivarea entitatii:', error);
            return null;
        }
    }

    //reactivare a unei entitati dezactivate
    async reactivate(id: string): Promise<T | null> {
        try {
            //isActive devine din nou true
            return this.update(id, { isActive: true } as unknown as Partial<T>);
        } catch (error) {
            console.error('Eroare la reactivarea entitatii:', error);
            return null;
        }
    }
}